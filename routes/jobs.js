const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Get all approved jobs, optionally filtered by team
router.get('/', async (req, res) => {
  try {
    const { team } = req.query;
    
    // First, let's get all approved jobs to debug
    const debugQuery = db.isPostgreSQL() 
      ? 'SELECT id, status, expires_at, team, job_title FROM jobs WHERE status = $1'
      : 'SELECT id, status, expires_at, team, job_title FROM jobs WHERE status = ?';
    
    try {
      const debugResult = await db.query(debugQuery, ['approved']);
      console.log('=== DEBUG: All approved jobs ===');
      debugResult.rows.forEach(row => {
        console.log(`ID: ${row.id}, Title: ${row.job_title}, Status: ${row.status}, Expires: ${row.expires_at}, Team: ${row.team}`);
      });
      console.log(`Total approved jobs in DB: ${debugResult.rows.length}`);
    } catch (debugErr) {
      console.error('Debug query error:', debugErr);
    }
    
    // Build query with optional team filter
    let sql = `
      SELECT 
        id,
        company_name,
        company_website,
        company_logo,
        job_title,
        job_location,
        job_type,
        experience_level,
        remote_onsite,
        compensation,
        team,
        application_link,
        created_at,
        expires_at
      FROM jobs
      WHERE status = $1
    `;
    
    const params = ['approved'];
    
    console.log(`Query params - team filter: ${team}`);
    
    if (team && team !== 'all') {
      sql += db.isPostgreSQL() ? ' AND LOWER(team) = LOWER($2)' : ' AND LOWER(team) = LOWER(?)';
      params.push(team);
      console.log(`Filtering by team: ${team}`);
    } else {
      console.log('No team filter - showing all approved jobs');
    }
    
    sql += ' ORDER BY created_at DESC';
    
    // Convert PostgreSQL placeholders to SQLite if needed
    const finalSql = db.isPostgreSQL() ? sql : sql.replace(/\$(\d+)/g, '?');
    
    console.log(`Executing query: ${finalSql}`);
    console.log(`With params:`, params);
    
    const result = await db.query(finalSql, params);
    const rows = result.rows;
    
    // Filter out expired jobs in JavaScript (more reliable)
    const now = new Date();
    const validJobs = rows.filter(row => {
      if (!row.expires_at) return true; // No expiration date means it never expires
      const expiresAt = new Date(row.expires_at);
      return expiresAt > now;
    });
    
    console.log(`Found ${rows.length} approved jobs, ${validJobs.length} not expired (team: ${team || 'all'})`);
    
    // Format jobs for frontend
    const jobs = validJobs.map(row => {
      let logo = row.company_logo;
      if (!logo && row.company_website) {
        try {
          const domain = new URL(row.company_website.startsWith('http') ? row.company_website : 'https://' + row.company_website).hostname;
          logo = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch (e) {
          console.error('Error creating logo URL:', e);
          logo = null;
        }
      }
      
      return {
        id: row.id,
        company: row.company_name,
        logo: logo,
        title: row.job_title,
        location: row.job_location,
        type: row.job_type,
        experience: row.experience_level,
        salary: row.compensation,
        applyLink: row.application_link
      };
    });
    
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ error: 'error al cargar los trabajos' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = db.isPostgreSQL() 
      ? 'SELECT * FROM jobs WHERE id = $1'
      : 'SELECT * FROM jobs WHERE id = ?';
    
    const row = await db.get(sql, [id]);
    
    if (!row) {
      return res.status(404).json({ error: 'trabajo no encontrado' });
    }
    
    res.json(row);
  } catch (err) {
    console.error('Error fetching job:', err);
    return res.status(500).json({ error: 'error al cargar el trabajo' });
  }
});

// Create new job (before payment)
router.post('/', async (req, res) => {
  try {
    // Validate request body exists
    if (!req.body || typeof req.body !== 'object') {
      console.error('Invalid request body:', req.body);
      return res.status(400).json({ error: 'cuerpo de la solicitud inválido' });
    }
    
    let {
      companyName,
      companyWebsite,
      jobTitle,
      jobLocation,
      jobType,
      experienceLevel,
      remoteOnsite,
      compensation,
      team,
      applicationLink,
      submitterName,
      submitterEmail
    } = req.body;
    
    console.log('Received job data:', {
      companyName: companyName ? 'present' : 'missing',
      jobTitle: jobTitle ? 'present' : 'missing',
      team: team ? 'present' : 'missing',
      hasBody: !!req.body
    });
    
    // Normalize team to lowercase
    if (team) {
      team = team.toLowerCase();
    }
    
    // Validate required fields
    if (!companyName || !companyWebsite || !jobTitle || !jobLocation || 
        !jobType || !experienceLevel || !remoteOnsite || !compensation || 
        !team || !applicationLink || !submitterName || !submitterEmail) {
      return res.status(400).json({ error: 'todos los campos son requeridos' });
    }
    
    // Get favicon
    let faviconUrl = null;
    try {
      const domain = new URL(companyWebsite.startsWith('http') ? companyWebsite : 'https://' + companyWebsite).hostname;
      faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      console.error('Error parsing URL:', e);
    }
    
    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Format date - PostgreSQL accepts ISO format, SQLite needs YYYY-MM-DD HH:MM:SS
    const expiresAtFormatted = db.isPostgreSQL() 
      ? expiresAt.toISOString()
      : expiresAt.toISOString().replace('T', ' ').substring(0, 19);
    
    console.log('Creating job with data:', {
      companyName,
      jobTitle,
      team,
      expiresAt: expiresAtFormatted
    });
    
    // Use RETURNING clause for PostgreSQL to get the ID directly
    const sql = db.isPostgreSQL()
      ? `
        INSERT INTO jobs (
          company_name, company_website, company_logo, job_title, job_location,
          job_type, experience_level, remote_onsite, compensation, team,
          application_link, submitter_name, submitter_email, status, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending', $14)
        RETURNING id
      `
      : `
        INSERT INTO jobs (
          company_name, company_website, company_logo, job_title, job_location,
          job_type, experience_level, remote_onsite, compensation, team,
          application_link, submitter_name, submitter_email, status, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `;
    
    // Convert to PostgreSQL format ($1, $2, ...) or SQLite format (?, ?, ...)
    const params = [
      companyName,
      companyWebsite,
      faviconUrl,
      jobTitle,
      jobLocation,
      jobType,
      experienceLevel,
      remoteOnsite,
      compensation,
      team,
      applicationLink,
      submitterName,
      submitterEmail,
      expiresAtFormatted
    ];
    
    const finalSql = db.isPostgreSQL() ? sql : sql.replace(/\$(\d+)/g, '?');
    
    const result = await db.query(finalSql, params);
    
    // PostgreSQL with RETURNING clause returns the ID in result.rows[0].id
    // SQLite returns it in result.lastID
    const finalJobId = db.isPostgreSQL() 
      ? (result.rows && result.rows[0] ? result.rows[0].id : null)
      : result.lastID;
    
    console.log('Job created successfully:', finalJobId);
    
    if (!finalJobId) {
      console.error('Warning: Could not retrieve job ID after creation');
      return res.status(500).json({ error: 'error al crear el trabajo: no se pudo obtener el ID' });
    }
    
    res.json({
      id: finalJobId,
      jobId: finalJobId, // Include both for compatibility
      message: 'Job created successfully'
    });
  } catch (err) {
    console.error('Error creating job:', err);
    console.error('Error stack:', err.stack);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    
    // Ensure we always return JSON
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'error al crear el trabajo: ' + (err.message || 'error desconocido'),
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }
});

// Update job payment status
router.patch('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentIntentId } = req.body;
    
    const sql = db.isPostgreSQL()
      ? 'UPDATE jobs SET payment_status = $1, payment_intent_id = $2 WHERE id = $3'
      : 'UPDATE jobs SET payment_status = ?, payment_intent_id = ? WHERE id = ?';
    
    const result = await db.query(sql, [paymentStatus, paymentIntentId, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'trabajo no encontrado' });
    }
    
    res.json({ message: 'Payment status updated' });
  } catch (err) {
    console.error('Error updating payment status:', err);
    return res.status(500).json({ error: 'error al actualizar el estado del pago' });
  }
});

// Admin: Approve job
router.patch('/:id/approve', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();
  
  database.run(
    'UPDATE jobs SET status = ?, approved_at = datetime("now") WHERE id = ?',
    ['approved', id],
    function(err) {
      if (err) {
        console.error('Error approving job:', err);
        return res.status(500).json({ error: 'error al aprobar el trabajo' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'trabajo no encontrado' });
      }
      
      res.json({ message: 'Job approved' });
    }
  );
});

// Admin: Reject job
router.patch('/:id/reject', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();
  
  database.run(
    'UPDATE jobs SET status = ? WHERE id = ?',
    ['rejected', id],
    function(err) {
      if (err) {
        console.error('Error rejecting job:', err);
        return res.status(500).json({ error: 'error al rechazar el trabajo' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'trabajo no encontrado' });
      }
      
      res.json({ message: 'Job rejected' });
    }
  );
});

module.exports = router;


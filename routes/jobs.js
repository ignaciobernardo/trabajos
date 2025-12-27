const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Get all approved jobs, optionally filtered by team
router.get('/', (req, res) => {
  const { team } = req.query;
  const database = db.getDb();
  
  // First, let's get all approved jobs to debug
  let debugQuery = 'SELECT id, status, expires_at, team, job_title FROM jobs WHERE status = ?';
  database.all(debugQuery, ['approved'], (debugErr, debugRows) => {
    if (!debugErr) {
      console.log('=== DEBUG: All approved jobs ===');
      debugRows.forEach(row => {
        console.log(`ID: ${row.id}, Title: ${row.job_title}, Status: ${row.status}, Expires: ${row.expires_at}, Team: ${row.team}`);
      });
      console.log(`Total approved jobs in DB: ${debugRows.length}`);
    }
  });
  
  // Build query with optional team filter
  let query = `
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
    WHERE status = ?
  `;
  
  const params = ['approved'];
  
  console.log(`Query params - team filter: ${team}`);
  
  if (team && team !== 'all') {
    query += ' AND LOWER(team) = LOWER(?)';
    params.push(team);
    console.log(`Filtering by team: ${team}`);
  } else {
    console.log('No team filter - showing all approved jobs');
  }
  
  query += ' ORDER BY created_at DESC';
  
  console.log(`Executing query: ${query}`);
  console.log(`With params:`, params);
  
  database.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching jobs:', err);
      console.error('Query was:', query);
      console.error('Params were:', params);
      return res.status(500).json({ error: 'error al cargar los trabajos' });
    }
    
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
  });
});

// Get job by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();
  
  database.get(
    'SELECT * FROM jobs WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        console.error('Error fetching job:', err);
        return res.status(500).json({ error: 'error al cargar el trabajo' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'trabajo no encontrado' });
      }
      
      res.json(row);
    }
  );
});

// Create new job (before payment)
router.post('/', async (req, res) => {
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
  
  const database = db.getDb();
  
  // Calculate expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  // Format date for SQLite (YYYY-MM-DD HH:MM:SS)
  const expiresAtFormatted = expiresAt.toISOString().replace('T', ' ').substring(0, 19);
  
  database.run(`
    INSERT INTO jobs (
      company_name, company_website, company_logo, job_title, job_location,
      job_type, experience_level, remote_onsite, compensation, team,
      application_link, submitter_name, submitter_email, status, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `, [
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
  ], function(err) {
    if (err) {
      console.error('Error creating job:', err);
      return res.status(500).json({ error: 'error al crear el trabajo' });
    }
    
    res.json({
      id: this.lastID,
      message: 'Job created successfully',
      jobId: this.lastID
    });
  });
});

// Update job payment status
router.patch('/:id/payment', (req, res) => {
  const { id } = req.params;
  const { paymentStatus, paymentIntentId } = req.body;
  const database = db.getDb();
  
  database.run(
    'UPDATE jobs SET payment_status = ?, payment_intent_id = ? WHERE id = ?',
    [paymentStatus, paymentIntentId, id],
    function(err) {
      if (err) {
        console.error('Error updating payment status:', err);
        return res.status(500).json({ error: 'error al actualizar el estado del pago' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'trabajo no encontrado' });
      }
      
      res.json({ message: 'Payment status updated' });
    }
  );
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


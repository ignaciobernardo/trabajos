const express = require('express');
const router = express.Router();
const db = require('../db/database');

// =============================================================================
// HELPERS
// =============================================================================

function getFaviconUrl(website) {
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

function formatJobForAPI(row) {
  return {
    id: row.id,
    company: row.company_name,
    logo: row.company_logo || getFaviconUrl(row.company_website),
    title: row.job_title,
    location: row.job_location,
    type: row.job_type,
    experience: row.experience_level,
    salary: row.compensation,
    applyLink: row.application_link
  };
}

function buildPlaceholders(count, startIndex = 1) {
  return Array.from({ length: count }, (_, i) => db.placeholder(startIndex + i)).join(', ');
}

// =============================================================================
// GET /api/jobs - List approved jobs
// =============================================================================

router.get('/', async (req, res) => {
  try {
    const { team } = req.query;
    const params = ['approved'];
    
    let sql = `
      SELECT id, company_name, company_website, company_logo, job_title,
             job_location, job_type, experience_level, remote_onsite,
             compensation, team, application_link, expires_at
      FROM jobs
      WHERE status = ${db.placeholder(1)}
    `;
    
    if (team && team !== 'all') {
      sql += ` AND LOWER(team) = LOWER(${db.placeholder(2)})`;
      params.push(team);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await db.query(sql, params);
    
    // Filter expired jobs
    const now = new Date();
    const jobs = result.rows
      .filter(row => !row.expires_at || new Date(row.expires_at) > now)
      .map(formatJobForAPI);
    
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err.message);
    res.status(500).json({ error: 'error al cargar los trabajos' });
  }
});

// =============================================================================
// GET /api/jobs/:id - Get single job
// =============================================================================

router.get('/:id', async (req, res) => {
  try {
    const sql = `SELECT * FROM jobs WHERE id = ${db.placeholder(1)}`;
    const row = await db.get(sql, [req.params.id]);
    
    if (!row) {
      return res.status(404).json({ error: 'trabajo no encontrado' });
    }
    
    res.json(row);
  } catch (err) {
    console.error('Error fetching job:', err.message);
    res.status(500).json({ error: 'error al cargar el trabajo' });
  }
});

// =============================================================================
// POST /api/jobs - Create new job
// =============================================================================

router.post('/', async (req, res) => {
  try {
    const {
      companyName, companyWebsite, jobTitle, jobLocation, jobType,
      experienceLevel, remoteOnsite, compensation, team,
      applicationLink, submitterName, submitterEmail
    } = req.body;
    
    // Validation
    const requiredFields = [
      companyName, companyWebsite, jobTitle, jobLocation, jobType,
      experienceLevel, remoteOnsite, compensation, team,
      applicationLink, submitterName, submitterEmail
    ];
    
    if (requiredFields.some(f => !f)) {
      return res.status(400).json({ error: 'todos los campos son requeridos' });
    }
    
    const faviconUrl = getFaviconUrl(companyWebsite);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
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
      (team || '').toLowerCase(),
      applicationLink,
      submitterName,
      submitterEmail,
      db.formatDate(expiresAt)
    ];
    
    const sql = db.isPostgreSQL()
      ? `INSERT INTO jobs (
           company_name, company_website, company_logo, job_title, job_location,
           job_type, experience_level, remote_onsite, compensation, team,
           application_link, submitter_name, submitter_email, expires_at, status
         ) VALUES (${buildPlaceholders(14)}, 'pending') RETURNING id`
      : `INSERT INTO jobs (
           company_name, company_website, company_logo, job_title, job_location,
           job_type, experience_level, remote_onsite, compensation, team,
           application_link, submitter_name, submitter_email, expires_at, status
         ) VALUES (${buildPlaceholders(14)}, 'pending')`;
    
    const result = await db.query(sql, params);
    const jobId = db.isPostgreSQL() ? result.rows[0]?.id : result.lastID;
    
    if (!jobId) {
      throw new Error('Failed to get job ID');
    }
    
    res.json({ id: jobId, jobId, message: 'trabajo creado exitosamente' });
  } catch (err) {
    console.error('Error creating job:', err.message);
    res.status(500).json({ error: 'error al crear el trabajo' });
  }
});

// =============================================================================
// PATCH /api/jobs/:id/payment - Update payment status
// =============================================================================

router.patch('/:id/payment', async (req, res) => {
  try {
    const { paymentStatus, paymentIntentId } = req.body;
    
    const sql = `
      UPDATE jobs 
      SET payment_status = ${db.placeholder(1)}, payment_intent_id = ${db.placeholder(2)} 
      WHERE id = ${db.placeholder(3)}
    `;
    
    const result = await db.query(sql, [paymentStatus, paymentIntentId, req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'trabajo no encontrado' });
    }
    
    res.json({ message: 'estado de pago actualizado' });
  } catch (err) {
    console.error('Error updating payment:', err.message);
    res.status(500).json({ error: 'error al actualizar el pago' });
  }
});

module.exports = router;

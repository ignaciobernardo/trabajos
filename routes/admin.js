const express = require('express');
const router = express.Router();
const db = require('../db/database');

// =============================================================================
// HELPERS
// =============================================================================

const JOB_FIELDS = `
  id, company_name, company_website, company_logo, job_title, job_location,
  job_type, experience_level, remote_onsite, compensation, team,
  application_link, submitter_name, submitter_email, status, payment_status,
  payment_intent_id, created_at, expires_at, approved_at
`;

// =============================================================================
// GET /api/admin/jobs - Get pending jobs
// =============================================================================

router.get('/jobs', async (req, res) => {
  try {
    const sql = `
      SELECT ${JOB_FIELDS}
      FROM jobs
      WHERE status = ${db.placeholder(1)}
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(sql, ['pending']);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pending jobs:', err.message);
    res.status(500).json({ error: 'error al cargar los trabajos pendientes' });
  }
});

// =============================================================================
// GET /api/admin/jobs/all - Get all jobs
// =============================================================================

router.get('/jobs/all', async (req, res) => {
  try {
    const sql = `SELECT ${JOB_FIELDS} FROM jobs ORDER BY created_at DESC`;
    const result = await db.query(sql, []);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching all jobs:', err.message);
    res.status(500).json({ error: 'error al cargar los trabajos' });
  }
});

// =============================================================================
// GET /api/admin/jobs/:id - Get single job
// =============================================================================

router.get('/jobs/:id', async (req, res) => {
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
// PATCH /api/admin/jobs/:id/approve - Approve job
// =============================================================================

router.patch('/jobs/:id/approve', async (req, res) => {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const sql = db.isPostgreSQL()
      ? `UPDATE jobs SET status = 'approved', approved_at = NOW(), expires_at = $1 WHERE id = $2`
      : `UPDATE jobs SET status = 'approved', approved_at = datetime('now'), expires_at = ? WHERE id = ?`;
    
    const result = await db.query(sql, [db.formatDate(expiresAt), req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'trabajo no encontrado' });
    }
    
    res.json({ message: 'trabajo aprobado exitosamente', id: req.params.id });
  } catch (err) {
    console.error('Error approving job:', err.message);
    res.status(500).json({ error: 'error al aprobar el trabajo' });
  }
});

// =============================================================================
// PATCH /api/admin/jobs/:id/reject - Reject job
// =============================================================================

router.patch('/jobs/:id/reject', async (req, res) => {
  try {
    const sql = `UPDATE jobs SET status = ${db.placeholder(1)} WHERE id = ${db.placeholder(2)}`;
    const result = await db.query(sql, ['rejected', req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'trabajo no encontrado' });
    }
    
    res.json({ message: 'trabajo rechazado', id: req.params.id });
  } catch (err) {
    console.error('Error rejecting job:', err.message);
    res.status(500).json({ error: 'error al rechazar el trabajo' });
  }
});

// =============================================================================
// DELETE /api/admin/jobs/:id - Delete job
// =============================================================================

router.delete('/jobs/:id', async (req, res) => {
  try {
    const sql = `DELETE FROM jobs WHERE id = ${db.placeholder(1)}`;
    const result = await db.query(sql, [req.params.id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'trabajo no encontrado' });
    }
    
    res.json({ message: 'trabajo eliminado exitosamente', id: req.params.id });
  } catch (err) {
    console.error('Error deleting job:', err.message);
    res.status(500).json({ error: 'error al eliminar el trabajo' });
  }
});

module.exports = router;

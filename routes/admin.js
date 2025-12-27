const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Get all pending jobs for admin review
router.get('/jobs', (req, res) => {
  const database = db.getDb();
  
  const query = `
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
      submitter_name,
      submitter_email,
      status,
      payment_status,
      payment_intent_id,
      created_at,
      expires_at
    FROM jobs
    WHERE status = 'pending'
    ORDER BY created_at DESC
  `;
  
  database.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching pending jobs:', err);
      return res.status(500).json({ error: 'error al cargar los trabajos pendientes' });
    }
    
    res.json(rows);
  });
});

// Get all jobs (pending, approved, rejected) for admin
router.get('/jobs/all', (req, res) => {
  const database = db.getDb();
  
  const query = `
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
      submitter_name,
      submitter_email,
      status,
      payment_status,
      payment_intent_id,
      created_at,
      expires_at,
      approved_at
    FROM jobs
    ORDER BY created_at DESC
  `;
  
  database.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching all jobs:', err);
      return res.status(500).json({ error: 'error al cargar los trabajos' });
    }
    
    res.json(rows);
  });
});

// Get single job by ID for admin
router.get('/jobs/:id', (req, res) => {
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

// Approve job
router.patch('/jobs/:id/approve', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();
  
  // Calculate expiration date (30 days from approval)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  // Format date for SQLite (YYYY-MM-DD HH:MM:SS)
  const expiresAtFormatted = expiresAt.toISOString().replace('T', ' ').substring(0, 19);
  
  // First, let's check the current state of the job
  database.get('SELECT id, status, expires_at FROM jobs WHERE id = ?', [id], (checkErr, job) => {
    if (checkErr) {
      console.error('Error checking job before approval:', checkErr);
      return res.status(500).json({ error: 'error al verificar el trabajo' });
    }
    
    if (!job) {
      return res.status(404).json({ error: 'trabajo no encontrado' });
    }
    
    console.log(`Before approval - Job ${id}: status=${job.status}, expires_at=${job.expires_at}`);
    
    database.run(
      'UPDATE jobs SET status = ?, approved_at = datetime("now"), expires_at = ? WHERE id = ?',
      ['approved', expiresAtFormatted, id],
      function(err) {
        if (err) {
          console.error('Error approving job:', err);
          return res.status(500).json({ error: 'error al aprobar el trabajo' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'trabajo no encontrado' });
        }
        
        console.log(`Job ${id} approved successfully. New status: approved, Expires at: ${expiresAtFormatted}`);
        
        // Verify the update
        database.get('SELECT id, status, expires_at FROM jobs WHERE id = ?', [id], (verifyErr, verifiedJob) => {
          if (!verifyErr && verifiedJob) {
            console.log(`After approval - Job ${id}: status=${verifiedJob.status}, expires_at=${verifiedJob.expires_at}`);
          }
        });
        
        res.json({ message: 'trabajo aprobado exitosamente', id: id });
      }
    );
  });
});

// Reject job
router.patch('/jobs/:id/reject', (req, res) => {
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
      
      res.json({ message: 'trabajo rechazado', id: id });
    }
  );
});

// Delete job
router.delete('/jobs/:id', (req, res) => {
  const { id } = req.params;
  const database = db.getDb();
  
  database.run(
    'DELETE FROM jobs WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        console.error('Error deleting job:', err);
        return res.status(500).json({ error: 'error al eliminar el trabajo' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'trabajo no encontrado' });
      }
      
      res.json({ message: 'trabajo eliminado exitosamente', id: id });
    }
  );
});

module.exports = router;


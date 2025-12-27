const express = require('express');
const router = express.Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// =============================================================================
// POST /api/auth/login
// =============================================================================

router.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'contraseña requerida' });
  }
  
  if (password.trim() === ADMIN_PASSWORD.trim()) {
    req.session.isAuthenticated = true;
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err.message);
        return res.status(500).json({ error: 'error al iniciar sesión' });
      }
      res.json({ success: true, message: 'sesión iniciada exitosamente' });
    });
  } else {
    res.status(401).json({ error: 'contraseña incorrecta' });
  }
});

// =============================================================================
// POST /api/auth/logout
// =============================================================================

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err.message);
      return res.status(500).json({ error: 'error al cerrar sesión' });
    }
    res.json({ success: true, message: 'sesión cerrada exitosamente' });
  });
});

// =============================================================================
// GET /api/auth/check
// =============================================================================

router.get('/check', (req, res) => {
  res.json({ authenticated: !!req.session?.isAuthenticated });
});

module.exports = router;

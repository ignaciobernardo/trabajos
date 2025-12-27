const express = require('express');
const router = express.Router();

// Admin password from environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Login route
router.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'contraseña requerida' });
  }
  
  if (password === ADMIN_PASSWORD) {
    req.session.isAuthenticated = true;
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ error: 'error al iniciar sesión' });
      }
      res.json({ success: true, message: 'sesión iniciada exitosamente' });
    });
  } else {
    res.status(401).json({ error: 'contraseña incorrecta' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'error al cerrar sesión' });
    }
    res.json({ success: true, message: 'sesión cerrada exitosamente' });
  });
});

// Check authentication status
router.get('/check', (req, res) => {
  res.json({ authenticated: !!req.session.isAuthenticated });
});

module.exports = router;


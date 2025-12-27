const express = require('express');
const router = express.Router();

// Admin password from environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Log password status (without exposing it)
console.log('Admin password configured:', ADMIN_PASSWORD ? 'YES' : 'NO');
console.log('Admin password length:', ADMIN_PASSWORD ? ADMIN_PASSWORD.length : 0);

// Login route
router.post('/login', (req, res) => {
  const { password } = req.body;
  
  console.log('Login attempt - Password received:', password ? '***' : 'empty');
  console.log('Expected password:', ADMIN_PASSWORD ? '***' : 'not set');
  console.log('Session ID before:', req.sessionID);
  
  if (!password) {
    return res.status(400).json({ error: 'contraseña requerida' });
  }
  
  // Trim and compare passwords
  const trimmedPassword = password.trim();
  const trimmedAdminPassword = ADMIN_PASSWORD.trim();
  
  console.log('Comparing passwords - lengths match:', trimmedPassword.length === trimmedAdminPassword.length);
  
  if (trimmedPassword === trimmedAdminPassword) {
    req.session.isAuthenticated = true;
    // Force save session
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ error: 'error al iniciar sesión' });
      }
      console.log('Session saved successfully. Session ID:', req.sessionID);
      console.log('isAuthenticated:', req.session.isAuthenticated);
      // Send response with session info
      res.json({ 
        success: true, 
        message: 'sesión iniciada exitosamente',
        sessionId: req.sessionID
      });
    });
  } else {
    console.log('Password mismatch - Expected length:', trimmedAdminPassword.length, 'Received length:', trimmedPassword.length);
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
  console.log('Auth check - Session ID:', req.sessionID);
  console.log('Auth check - isAuthenticated:', req.session.isAuthenticated);
  console.log('Auth check - Session:', req.session);
  res.json({ authenticated: !!req.session.isAuthenticated });
});

module.exports = router;


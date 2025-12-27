const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const COOKIE_SECRET = process.env.SESSION_SECRET || 'change-this-secret-in-production';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// =============================================================================
// HELPERS
// =============================================================================

function createAuthToken() {
  const timestamp = Date.now();
  const data = `authenticated:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', COOKIE_SECRET)
    .update(data)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

function verifyAuthToken(token) {
  if (!token) return false;
  
  try {
    const [timestamp, signature] = token.split('.');
    if (!timestamp || !signature) return false;
    
    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) return false;
    
    // Verify signature
    const data = `authenticated:${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', COOKIE_SECRET)
      .update(data)
      .digest('hex');
    
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

// =============================================================================
// POST /api/auth/login
// =============================================================================

router.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'contraseña requerida' });
  }
  
  if (password.trim() === ADMIN_PASSWORD.trim()) {
    const token = createAuthToken();
    
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });
    
    res.json({ success: true, message: 'sesión iniciada exitosamente' });
  } else {
    res.status(401).json({ error: 'contraseña incorrecta' });
  }
});

// =============================================================================
// POST /api/auth/logout
// =============================================================================

router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', { path: '/' });
  res.json({ success: true, message: 'sesión cerrada exitosamente' });
});

// =============================================================================
// GET /api/auth/check
// =============================================================================

router.get('/check', (req, res) => {
  const token = req.cookies?.auth_token;
  const authenticated = verifyAuthToken(token);
  res.json({ authenticated });
});

module.exports = router;

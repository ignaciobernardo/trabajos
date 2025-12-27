/**
 * Authentication middleware
 * Protects admin routes using signed cookies
 */

const crypto = require('crypto');

const COOKIE_SECRET = process.env.SESSION_SECRET || 'change-this-secret-in-production';

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

function requireAuth(req, res, next) {
  const token = req.cookies?.auth_token;
  
  if (verifyAuthToken(token)) {
    return next();
  }
  
  res.status(401).json({ error: 'no autorizado' });
}

module.exports = requireAuth;

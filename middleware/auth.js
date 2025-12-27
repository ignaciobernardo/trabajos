/**
 * Authentication middleware
 * Protects admin routes
 */

function requireAuth(req, res, next) {
  if (req.session?.isAuthenticated) {
    return next();
  }
  res.status(401).json({ error: 'no autorizado' });
}

module.exports = requireAuth;

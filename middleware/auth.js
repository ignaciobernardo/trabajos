// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  } else {
    return res.status(401).json({ error: 'no autorizado. por favor inicia sesión.' });
  }
}

module.exports = requireAuth;


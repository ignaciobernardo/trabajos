const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Import modules
const db = require('./db/database');
const jobsRoutes = require('./routes/jobs');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const requireAuth = require('./middleware/auth');

// Constants
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const COOKIE_SECRET = process.env.SESSION_SECRET || 'change-this-secret-in-production';

// Create Express app
const app = express();

// =============================================================================
// SECURITY MIDDLEWARE
// =============================================================================

app.use(helmet({ contentSecurityPolicy: false }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// =============================================================================
// BODY PARSING, COOKIES & CORS
// =============================================================================

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));

// =============================================================================
// DATABASE INITIALIZATION
// =============================================================================

let dbInitPromise = null;

async function initDatabase() {
  if (!dbInitPromise) {
    dbInitPromise = db.init().catch(err => {
      console.error('❌ Database initialization failed:', err.message);
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
}

// Middleware: ensure JSON responses for API
app.use('/api', (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson(data);
  };
  next();
});

// Middleware: initialize DB for API routes (skip auth routes)
app.use('/api', async (req, res, next) => {
  if (req.path.startsWith('/auth')) return next();
  
  try {
    await initDatabase();
    next();
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'error de base de datos' });
  }
});

// =============================================================================
// STATIC FILES & ROUTES
// =============================================================================

app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', requireAuth, adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (res.headersSent) return next(err);
  
  const status = err.status || 500;
  const message = err.message || 'error interno del servidor';
  
  res.status(status).json({ error: message });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

initDatabase()
  .then(() => console.log('✅ Database ready'))
  .catch(err => console.error('⚠️ Database will init on first request'));

if (!process.env.VERCEL) {
  initDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  });
}

module.exports = app;

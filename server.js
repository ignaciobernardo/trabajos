const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const db = require('./db/database');
const jobsRoutes = require('./routes/jobs');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const requireAuth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for simplicity
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Session configuration
// For Vercel serverless, we need resave and saveUninitialized set to true
app.use(session({
  secret: process.env.SESSION_SECRET || 'simplemente-trabajos-secret-key-change-in-production',
  resave: true, // Required for Vercel
  saveUninitialized: true, // Required for Vercel
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax', // Important for cross-site requests
    domain: undefined // Let browser set domain automatically
  },
  name: 'jobs.sid' // Custom session name
}));

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database (non-blocking)
let dbInitPromise = null;

function ensureDbInitialized() {
  if (!dbInitPromise) {
    dbInitPromise = db.init().catch(err => {
      console.error('❌ Failed to initialize database:', err);
      dbInitPromise = null; // Allow retry
      throw err;
    });
  }
  return dbInitPromise;
}

// Ensure all API responses are JSON
app.use('/api', (req, res, next) => {
  // Override res.json to ensure it always sets content-type
  const originalJson = res.json;
  res.json = function(data) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson.call(this, data);
  };
  next();
});

// Ensure DB is initialized before handling API requests
app.use('/api', async (req, res, next) => {
  try {
    await ensureDbInitialized();
    next();
  } catch (err) {
    console.error('Database initialization error:', err);
    console.error('Database initialization error stack:', err.stack);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(500).json({ 
        error: 'error de inicialización de base de datos',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/jobs', jobsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', requireAuth, adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


// Serve admin.html (will be protected by client-side auth check)
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve login.html
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve static files explicitly
app.get('/trabajos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler - must be last
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  console.error('Error stack:', err.stack);
  
  // If response already sent, delegate to default handler
  if (res.headersSent) {
    return next(err);
  }
  
  // Always return JSON for API routes
  if (req.path.startsWith('/api')) {
    return res.status(err.status || 500).json({
      error: err.message || 'error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  
  // For non-API routes, send error page or redirect
  res.status(err.status || 500).json({
    error: err.message || 'error interno del servidor'
  });
});

// Initialize database on startup (non-blocking)
ensureDbInitialized().then(() => {
  console.log(`✅ Database initialized`);
}).catch(err => {
  console.error('⚠️  Database initialization failed, will retry on first request:', err);
});

// For local development, start server
if (!process.env.VERCEL) {
  ensureDbInitialized().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }).catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
}

// Export for Vercel
module.exports = app;


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
app.use(session({
  secret: process.env.SESSION_SECRET || 'simplemente-trabajos-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Ensure DB is initialized before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureDbInitialized();
    next();
  } catch (err) {
    console.error('Database initialization error:', err);
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

// Export for Vercel
module.exports = app;


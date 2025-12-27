/**
 * Database abstraction layer
 * Supports SQLite (development) and PostgreSQL (production)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configuration
const DB_PATH = path.join(__dirname, 'jobs.db');
const USE_POSTGRES = !!process.env.DATABASE_URL;

// Database instances
let sqliteDb = null;
let pgPool = null;

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

function getDb() {
  if (USE_POSTGRES) {
    if (!pgPool) {
      const { Pool } = require('pg');
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
      });
    }
    return pgPool;
  }
  
  if (!sqliteDb) {
    sqliteDb = new sqlite3.Database(DB_PATH, (err) => {
      if (err) console.error('SQLite connection error:', err.message);
    });
  }
  return sqliteDb;
}

// =============================================================================
// INITIALIZATION
// =============================================================================

async function init() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS jobs (
      id ${USE_POSTGRES ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${USE_POSTGRES ? '' : 'AUTOINCREMENT'},
      company_name TEXT NOT NULL,
      company_website TEXT NOT NULL,
      company_logo TEXT,
      job_title TEXT NOT NULL,
      job_location TEXT NOT NULL,
      job_type TEXT NOT NULL,
      experience_level TEXT NOT NULL,
      remote_onsite TEXT NOT NULL,
      compensation TEXT NOT NULL,
      team TEXT NOT NULL,
      application_link TEXT NOT NULL,
      submitter_name TEXT NOT NULL,
      submitter_email TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      payment_intent_id TEXT,
      created_at ${USE_POSTGRES ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
      expires_at ${USE_POSTGRES ? 'TIMESTAMP' : 'DATETIME'},
      approved_at ${USE_POSTGRES ? 'TIMESTAMP' : 'DATETIME'}
    )
  `;

  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_team_status ON jobs(team, status)',
    'CREATE INDEX IF NOT EXISTS idx_expires_at ON jobs(expires_at)'
  ];

  if (USE_POSTGRES) {
    const db = getDb();
    await db.query('SELECT NOW()'); // Test connection
    await db.query(createTableSQL);
    for (const idx of createIndexes) {
      await db.query(idx);
    }
    console.log('✅ PostgreSQL initialized');
  } else {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.serialize(() => {
        db.run(createTableSQL, (err) => {
          if (err) return reject(err);
          createIndexes.forEach(idx => db.run(idx));
          console.log('✅ SQLite initialized');
          resolve();
        });
      });
    });
  }
}

// =============================================================================
// QUERY ABSTRACTION
// =============================================================================

async function query(sql, params = []) {
  const db = getDb();
  
  if (USE_POSTGRES) {
    const result = await db.query(sql, params);
    return {
      rows: result.rows || [],
      lastID: result.rows?.[0]?.id || null,
      changes: result.rowCount || 0
    };
  }
  
  return new Promise((resolve, reject) => {
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
    
    if (isSelect) {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows: rows || [], lastID: null, changes: rows?.length || 0 });
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ rows: [], lastID: this.lastID, changes: this.changes });
      });
    }
  });
}

async function get(sql, params = []) {
  if (USE_POSTGRES) {
    const db = getDb();
    const result = await db.query(sql, params);
    return result.rows[0] || null;
  }
  
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

// =============================================================================
// UTILITIES
// =============================================================================

function isPostgreSQL() {
  return USE_POSTGRES;
}

function placeholder(index) {
  return USE_POSTGRES ? `$${index}` : '?';
}

function formatDate(date) {
  return USE_POSTGRES 
    ? date.toISOString() 
    : date.toISOString().replace('T', ' ').substring(0, 19);
}

async function close() {
  if (USE_POSTGRES && pgPool) {
    await pgPool.end();
    pgPool = null;
  } else if (sqliteDb) {
    return new Promise((resolve, reject) => {
      sqliteDb.close((err) => {
        if (err) reject(err);
        else {
          sqliteDb = null;
          resolve();
        }
      });
    });
  }
}

module.exports = {
  getDb,
  init,
  query,
  get,
  close,
  isPostgreSQL,
  placeholder,
  formatDate
};

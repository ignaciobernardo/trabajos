// Use PostgreSQL if DATABASE_URL is set, otherwise use SQLite
let db = null;
let pgDb = null;

// Try to load PostgreSQL
try {
  if (process.env.DATABASE_URL) {
    const pg = require('./database-pg');
    pgDb = pg;
    console.log('📊 Using PostgreSQL database');
  }
} catch (e) {
  console.log('⚠️  PostgreSQL not available, using SQLite');
}

// SQLite fallback
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, 'jobs.db');

function getDb() {
  // Use PostgreSQL if available
  if (pgDb && process.env.DATABASE_URL) {
    return pgDb.getDb();
  }
  
  // Otherwise use SQLite
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      }
    });
  }
  return db;
}

function init() {
  // Use PostgreSQL if available
  if (pgDb && process.env.DATABASE_URL) {
    return pgDb.init();
  }
  
  // Otherwise use SQLite
  return new Promise((resolve, reject) => {
    const database = getDb();
    
    database.serialize(() => {
      // Jobs table
      database.run(`
        CREATE TABLE IF NOT EXISTS jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME,
          approved_at DATETIME
        )
      `, (err) => {
        if (err) {
          console.error('Error creating jobs table:', err);
          reject(err);
          return;
        }
        
        // Create index for faster queries
        database.run(`
          CREATE INDEX IF NOT EXISTS idx_team_status ON jobs(team, status)
        `, (err) => {
          if (err) {
            console.error('Error creating index:', err);
          }
        });
        
        database.run(`
          CREATE INDEX IF NOT EXISTS idx_expires_at ON jobs(expires_at)
        `, (err) => {
          if (err) {
            console.error('Error creating index:', err);
          }
        });
        
        console.log('✅ Database initialized successfully');
        resolve();
      });
    });
  });
}

function close() {
  // Use PostgreSQL if available
  if (pgDb && process.env.DATABASE_URL) {
    return pgDb.close();
  }
  
  // Otherwise use SQLite
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

// Helper functions to abstract SQLite vs PostgreSQL differences
function isPostgreSQL() {
  return pgDb && process.env.DATABASE_URL;
}

// Execute a query (works for both SQLite and PostgreSQL)
async function query(sql, params = []) {
  const database = getDb();
  
  if (isPostgreSQL()) {
    // PostgreSQL uses promises
    try {
      const result = await database.query(sql, params);
      // For INSERT with RETURNING, rows will contain the returned data
      // For regular INSERT/UPDATE/DELETE, rowCount is the number of affected rows
      return {
        rows: result.rows || [],
        lastID: result.rows && result.rows[0] ? result.rows[0].id : null,
        changes: result.rowCount || 0
      };
    } catch (err) {
      console.error('PostgreSQL query error:', err);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw err;
    }
  } else {
    // SQLite uses callbacks, convert to promise
    return new Promise((resolve, reject) => {
      // Check if it's a SELECT query
      const sqlUpper = sql.trim().toUpperCase();
      const isSelect = sqlUpper.startsWith('SELECT');
      
      if (isSelect) {
        database.all(sql, params, (err, rows) => {
          if (err) {
            console.error('SQLite SELECT error:', err);
            console.error('SQL:', sql);
            console.error('Params:', params);
            reject(err);
          } else {
            resolve({ rows: rows || [], lastID: null, changes: rows ? rows.length : 0 });
          }
        });
      } else {
        // For INSERT/UPDATE/DELETE, use run
        database.run(sql, params, function(err) {
          if (err) {
            console.error('SQLite INSERT/UPDATE/DELETE error:', err);
            console.error('SQL:', sql);
            console.error('Params:', params);
            reject(err);
          } else {
            resolve({
              rows: [],
              lastID: this.lastID,
              changes: this.changes
            });
          }
        });
      }
    });
  }
}

// Get a single row (works for both SQLite and PostgreSQL)
async function get(sql, params = []) {
  const database = getDb();
  
  if (isPostgreSQL()) {
    const result = await database.query(sql, params);
    return result.rows[0] || null;
  } else {
    return new Promise((resolve, reject) => {
      database.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }
}

module.exports = {
  getDb,
  init,
  close,
  query,
  get,
  isPostgreSQL
};


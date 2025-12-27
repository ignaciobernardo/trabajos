const path = require('path');
const fs = require('fs');

// Check if DATABASE_URL is set (PostgreSQL in production)
const usePostgres = !!process.env.DATABASE_URL;

let db = null;
let dbType = null;

// SQLite setup
if (!usePostgres) {
  const sqlite3 = require('sqlite3').verbose();
  const DB_PATH = path.join(__dirname, 'jobs.db');
  
  function getDb() {
    if (!db) {
      db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Error opening database:', err);
        }
      });
      dbType = 'sqlite';
    }
    return db;
  }
  
  function init() {
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
          
          // Create indexes
          database.run(`
            CREATE INDEX IF NOT EXISTS idx_team_status ON jobs(team, status)
          `, (err) => {
            if (err) console.error('Error creating index:', err);
          });
          
          database.run(`
            CREATE INDEX IF NOT EXISTS idx_expires_at ON jobs(expires_at)
          `, (err) => {
            if (err) console.error('Error creating index:', err);
          });
          
          console.log('✅ SQLite database initialized successfully');
          resolve();
        });
      });
    });
  }
  
  function close() {
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
  
  module.exports = {
    getDb,
    init,
    close,
    dbType: () => 'sqlite'
  };
} else {
  // PostgreSQL setup
  const { Pool } = require('pg');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false
  });
  
  function getDb() {
    return pool;
  }
  
  function init() {
    return new Promise(async (resolve, reject) => {
      try {
        const client = await pool.connect();
        
        // Create jobs table
        await client.query(`
          CREATE TABLE IF NOT EXISTS jobs (
            id SERIAL PRIMARY KEY,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            approved_at TIMESTAMP
          )
        `);
        
        // Create indexes
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_team_status ON jobs(team, status)
        `).catch(() => {}); // Ignore if exists
        
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_expires_at ON jobs(expires_at)
        `).catch(() => {}); // Ignore if exists
        
        client.release();
        console.log('✅ PostgreSQL database initialized successfully');
        resolve();
      } catch (err) {
        console.error('Error initializing PostgreSQL:', err);
        reject(err);
      }
    });
  }
  
  function close() {
    return pool.end();
  }
  
  module.exports = {
    getDb,
    init,
    close,
    dbType: () => 'postgres'
  };
}

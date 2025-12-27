// PostgreSQL database configuration (for production)
// Use this when DATABASE_URL is set (Railway, Supabase, etc.)

const { Pool } = require('pg');

let pool = null;

function getDb() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

async function init() {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not set, using SQLite');
    return Promise.resolve();
  }

  console.log('📊 Connecting to PostgreSQL...');
  const database = getDb();
  if (!database) {
    console.error('❌ Failed to create database connection - getDb() returned null');
    throw new Error('Failed to create database connection');
  }

  try {
    // Test connection first
    console.log('📊 Testing PostgreSQL connection...');
    await database.query('SELECT NOW()');
    console.log('✅ PostgreSQL connection successful');
    
    // Create jobs table
    console.log('📊 Creating jobs table...');
    await database.query(`
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
    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_team_status ON jobs(team, status)
    `);

    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_expires_at ON jobs(expires_at)
    `);

    console.log('✅ PostgreSQL database initialized successfully');
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error initializing PostgreSQL database:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getDb,
  init,
  close
};


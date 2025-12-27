// Database query abstraction layer for SQLite and PostgreSQL

function isPostgres(db) {
  return db && typeof db.query === 'function';
}

// Convert PostgreSQL params ($1, $2) to SQLite params (?, ?)
function adaptParams(sql, params) {
  if (isPostgres(db)) {
    return { sql, params };
  } else {
    // Convert $1, $2, etc to ?
    let paramIndex = 1;
    const adaptedSql = sql.replace(/\$\d+/g, () => {
      const value = params[paramIndex - 1];
      paramIndex++;
      return '?';
    });
    return { sql: adaptedSql, params };
  }
}

// Execute a query and return results
function query(db, sql, params = []) {
  if (isPostgres(db)) {
    return db.query(sql, params).then(result => result.rows);
  } else {
    // Convert PostgreSQL syntax to SQLite
    const adapted = adaptParams(sql, params, db);
    return new Promise((resolve, reject) => {
      db.all(adapted.sql, adapted.params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

// Execute a query and return single row
function queryOne(db, sql, params = []) {
  if (isPostgres(db)) {
    return db.query(sql, params).then(result => result.rows[0] || null);
  } else {
    const adapted = adaptParams(sql, params, db);
    return new Promise((resolve, reject) => {
      db.get(adapted.sql, adapted.params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }
}

// Execute a query that modifies data (INSERT, UPDATE, DELETE)
function execute(db, sql, params = []) {
  if (isPostgres(db)) {
    // For INSERT, add RETURNING id
    if (sql.toUpperCase().includes('INSERT INTO')) {
      sql = sql.replace(/;$/, '') + ' RETURNING id';
    }
    return db.query(sql, params).then(result => ({
      lastID: result.rows[0]?.id || null,
      changes: result.rowCount || 0
    }));
  } else {
    const adapted = adaptParams(sql, params, db);
    return new Promise((resolve, reject) => {
      db.run(adapted.sql, adapted.params, function(err) {
        if (err) reject(err);
        else resolve({
          lastID: this.lastID,
          changes: this.changes
        });
      });
    });
  }
}

module.exports = {
  query,
  queryOne,
  execute,
  isPostgres
};

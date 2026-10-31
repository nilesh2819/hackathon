const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbType = 'sqlite';
let pgPool = null;
let sqliteDb = null;

const dbFile = path.resolve(__dirname, 'reclaim_ai.sqlite');

const usePostgres = process.env.USE_POSTGRES === 'true' || Boolean(process.env.DATABASE_URL);

function initDatabase() {
  return new Promise((resolve, reject) => {
    if (usePostgres) {
      const config = process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {
            host: process.env.PGHOST || 'localhost',
            port: parseInt(process.env.PGPORT || '5432', 10),
            user: process.env.PGUSER || 'postgres',
            password: process.env.PGPASSWORD || 'postgres',
            database: process.env.PGDATABASE || 'reclaim_ai_db',
          };

      const testPool = new Pool(config);
      testPool.query('SELECT NOW()', (err, res) => {
        if (err) {
          console.warn('⚠️  PostgreSQL connection failed:', err.message);
          console.log('🔄 Falling back to embedded high-performance SQLite engine...');
          initSqlite().then(resolve).catch(reject);
        } else {
          console.log('✅ Connected to PostgreSQL database at', config.host || 'DATABASE_URL');
          pgPool = testPool;
          dbType = 'postgres';
          resolve({ type: 'postgres', pool: pgPool });
        }
      });
    } else {
      initSqlite().then(resolve).catch(reject);
    }
  });
}

function initSqlite() {
  return new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        console.error('❌ Failed to open SQLite database:', err.message);
        return reject(err);
      }
      dbType = 'sqlite';
      sqliteDb.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
        if (pragmaErr) console.warn('Notice enabling foreign keys in SQLite');
        console.log('✅ SQLite database initialized at:', dbFile);
        resolve({ type: 'sqlite', db: sqliteDb });
      });
    });
  });
}

// Convert PostgreSQL parameterized query ($1, $2, ...) and DDL to SQLite
function transformSqlForSqlite(sql, params) {
  let newParams = [];
  let transformedSql = sql.replace(/\$(\d+)/g, (match, index) => {
    const idx = parseInt(index, 10) - 1;
    if (params && idx >= 0 && idx < params.length) {
      newParams.push(params[idx]);
    }
    return '?';
  });

  // DDL replacements
  transformedSql = transformedSql.replace(/\bSERIAL PRIMARY KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  transformedSql = transformedSql.replace(/\bNUMERIC\([^)]*\)/gi, 'NUMERIC');
  transformedSql = transformedSql.replace(/\bDROP TABLE IF EXISTS ([a-zA-Z0-9_]+) CASCADE/gi, 'DROP TABLE IF EXISTS $1');
  transformedSql = transformedSql.replace(/\bBOOLEAN NOT NULL DEFAULT TRUE\b/gi, 'INTEGER NOT NULL DEFAULT 1');
  transformedSql = transformedSql.replace(/\bBOOLEAN NOT NULL DEFAULT FALSE\b/gi, 'INTEGER NOT NULL DEFAULT 0');
  transformedSql = transformedSql.replace(/\bBOOLEAN DEFAULT TRUE\b/gi, 'INTEGER DEFAULT 1');
  transformedSql = transformedSql.replace(/\bBOOLEAN DEFAULT FALSE\b/gi, 'INTEGER DEFAULT 0');
  transformedSql = transformedSql.replace(/\bBOOLEAN\b/gi, 'INTEGER');
  transformedSql = transformedSql.replace(/\bDEFAULT TRUE\b/gi, 'DEFAULT 1');
  transformedSql = transformedSql.replace(/\bDEFAULT FALSE\b/gi, 'DEFAULT 0');
  transformedSql = transformedSql.replace(/\bGREATEST\(/gi, 'MAX(');
  transformedSql = transformedSql.replace(/\bLEAST\(/gi, 'MIN(');

  return { sql: transformedSql, params: newParams.length > 0 ? newParams : params };
}

async function query(sql, params = []) {
  if (dbType === 'postgres') {
    const res = await pgPool.query(sql, params);
    return {
      rows: res.rows,
      rowCount: res.rowCount,
      fields: res.fields
    };
  } else {
    return new Promise((resolve, reject) => {
      const { sql: sqliteSql, params: transformedParams } = transformSqlForSqlite(sql, params);

      const isSelect = /^\s*(SELECT|PRAGMA)/i.test(sqliteSql);

      if (isSelect) {
        sqliteDb.all(sqliteSql, transformedParams, (err, rows) => {
          if (err) return reject(err);
          resolve({ rows: rows || [], rowCount: (rows || []).length });
        });
      } else {
        sqliteDb.run(sqliteSql, transformedParams, function (err) {
          if (err) return reject(err);
          resolve({
            rows: [{ id: this.lastID }],
            rowCount: this.changes,
            lastID: this.lastID
          });
        });
      }
    });
  }
}

async function getClient() {
  if (dbType === 'postgres') {
    return await pgPool.connect();
  }
  return {
    query: (sql, params) => query(sql, params),
    release: () => {}
  };
}

module.exports = {
  initDatabase,
  query,
  getClient,
  getDbType: () => dbType
};

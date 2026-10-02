const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbType = 'sqlite';
let sqliteDb = null;
let mysqlPool = null;

const sqlitePath = path.resolve(__dirname, '..', 'nexus.sqlite');

// Initialize database
async function initDatabase() {
  if (process.env.USE_MYSQL === 'true' || (process.env.DB_PASSWORD && process.env.DB_USER)) {
    try {
      const mysql = require('mysql2/promise');
      mysqlPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nexus_db',
        port: parseInt(process.env.DB_PORT || '3306'),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test connection
      const [rows] = await mysqlPool.query('SELECT 1 as connected');
      if (rows && rows[0]?.connected === 1) {
        dbType = 'mysql';
        console.log('[NEXUS Database] Connected successfully to MySQL database (' + (process.env.DB_NAME || 'nexus_db') + ')');
        return;
      }
    } catch (err) {
      console.warn('[NEXUS Database] MySQL connection failed (' + err.message + '). Falling back seamlessly to local SQLite storage.');
    }
  }

  // Fallback to SQLite (built-in node:sqlite in Node.js 22+)
  try {
    const { DatabaseSync } = require('node:sqlite');
    if (!fs.existsSync(sqlitePath)) {
      console.log('[NEXUS Database] Creating fresh SQLite database at:', sqlitePath);
    }
    sqliteDb = new DatabaseSync(sqlitePath);
    dbType = 'sqlite';
    console.log('[NEXUS Database] Connected successfully to SQLite database (' + sqlitePath + ')');
  } catch (err) {
    console.error('[NEXUS Database] Failed to initialize SQLite database:', err);
    throw err;
  }
}

// Unified query runner
async function query(sql, params = []) {
  if (dbType === 'mysql' && mysqlPool) {
    const [result] = await mysqlPool.query(sql, params);
    return result;
  }

  if (dbType === 'sqlite' && sqliteDb) {
    const trimmed = sql.trim();
    const isSelect = /^SELECT/i.test(trimmed) || /^PRAGMA/i.test(trimmed);

    try {
      const stmt = sqliteDb.prepare(sql);
      if (isSelect) {
        return stmt.all(...params);
      } else {
        const info = stmt.run(...params);
        return {
          insertId: Number(info.lastInsertRowid),
          affectedRows: info.changes,
          changes: info.changes
        };
      }
    } catch (err) {
      console.error('[NEXUS SQL Error]:', err.message, '\nQuery:', sql, '\nParams:', params);
      throw err;
    }
  }

  throw new Error('Database is not initialized yet');
}

function getDbType() {
  return dbType;
}

module.exports = {
  initDatabase,
  query,
  getDbType
};

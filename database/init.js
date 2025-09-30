const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'audit_dashboard.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Companies table
      db.run(`
        CREATE TABLE IF NOT EXISTS companies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Users table (for admin authentication)
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Audits table
      db.run(`
        CREATE TABLE IF NOT EXISTS audits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          company_id INTEGER NOT NULL,
          filename TEXT NOT NULL,
          original_filename TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          file_type TEXT NOT NULL,
          audit_date DATE NOT NULL,
          branch_number TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL CHECK (status IN ('aprovada', 'aprovada-com-aviso', 'reprovada')),
          uploaded_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies (id),
          FOREIGN KEY (uploaded_by) REFERENCES users (id)
        )
      `);

      // News table
      db.run(`
        CREATE TABLE IF NOT EXISTS news (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          summary TEXT NOT NULL,
          content TEXT,
          news_date DATE NOT NULL,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Insert default companies
      db.run(`
        INSERT OR IGNORE INTO companies (name, display_name) VALUES 
        ('carol', 'Carol'),
        ('grand-vision', 'Grand Vision'),
        ('sunglass-hut', 'SunglassHut')
      `);

      // Insert default admin user
      const defaultPassword = 'admin@2025';
      bcrypt.hash(defaultPassword, 10, (err, hash) => {
        if (err) {
          reject(err);
          return;
        }

        db.run(`
          INSERT OR IGNORE INTO users (email, password_hash, role) VALUES 
          ('lux@2025', ?, 'admin')
        `, [hash], function(err) {
          if (err) {
            reject(err);
          } else {
            console.log('Database initialized successfully');
            console.log('Default admin credentials: lux@2025 / admin@2025');
            resolve();
          }
        });
      });
    });
  });
}

// Get database instance
function getDatabase() {
  return db;
}

// Close database connection
function closeDatabase() {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
      resolve();
    });
  });
}

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};


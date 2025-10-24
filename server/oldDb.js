const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use in-memory database for Vercel (serverless environment)
// In production, you should use a proper database service like PlanetScale, Supabase, or MongoDB
const db = process.env.NODE_ENV === 'production' 
  ? new sqlite3.Database(':memory:')  // In-memory database for Vercel
  : new sqlite3.Database(path.join(__dirname, 'todo.sqlite'));  // File database for local development

// User- und Todo-Tabellen anlegen
function init() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      text TEXT NOT NULL,
      dueDate TEXT,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id),
      UNIQUE(date, time)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    // Testuser anlegen, falls nicht vorhanden
    db.get('SELECT * FROM users WHERE username = ?', ['test'], (err, row) => {
      if (!row) {
        const bcrypt = require('bcryptjs');
        db.run('INSERT INTO users (username, passwordHash) VALUES (?, ?)', [
          'test',
          bcrypt.hashSync('test123', 8)
        ]);
      }
    });
  });
}

module.exports = { db, init };

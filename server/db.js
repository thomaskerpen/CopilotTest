const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'todo.sqlite'));

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

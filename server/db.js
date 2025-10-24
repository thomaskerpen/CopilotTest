// Database abstraction - supports both SQLite (local) and Vercel KV (production)
const USE_KV = process.env.NODE_ENV === 'production' || process.env.VERCEL;

let db;

if (USE_KV) {
  // Use Vercel KV for production
  console.log('Using Vercel KV database');
  db = require('./kvDatabase');
} else {
  // Use SQLite for local development
  console.log('Using SQLite database');
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');

  // Create in-memory database for development
  const sqliteDb = new sqlite3.Database(':memory:');

  // Initialize SQLite tables
  sqliteDb.serialize(() => {
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      text TEXT,
      dueDate TEXT,
      completed BOOLEAN,
      createdAt TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      date TEXT,
      time TEXT,
      createdAt TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);

    sqliteDb.run(`CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      message TEXT,
      createdAt TEXT
    )`);
  });

  // SQLite wrapper to match KV interface
  db = {
    // Users
    createUser: (username, hashedPassword) => {
      return new Promise((resolve, reject) => {
        sqliteDb.run(
          'INSERT INTO users (username, password) VALUES (?, ?)',
          [username, hashedPassword],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, username, password: hashedPassword });
          }
        );
      });
    },

    getUserByUsername: (username) => {
      return new Promise((resolve, reject) => {
        sqliteDb.get(
          'SELECT * FROM users WHERE username = ?',
          [username],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    },

    // Todos
    getTodosByUserId: (userId) => {
      return new Promise((resolve, reject) => {
        sqliteDb.all(
          'SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC',
          [userId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    },

    createTodo: (userId, text, dueDate) => {
      return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString();
        sqliteDb.run(
          'INSERT INTO todos (userId, text, dueDate, completed, createdAt) VALUES (?, ?, ?, 0, ?)',
          [userId, text, dueDate, createdAt],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, userId, text, dueDate, completed: false, createdAt });
          }
        );
      });
    },

    updateTodo: (todoId, updates) => {
      return new Promise((resolve, reject) => {
        sqliteDb.run(
          'UPDATE todos SET completed = ? WHERE id = ?',
          [updates.completed, todoId],
          function(err) {
            if (err) reject(err);
            else {
              sqliteDb.get('SELECT * FROM todos WHERE id = ?', [todoId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          }
        );
      });
    },

    deleteTodo: (todoId, userId) => {
      return new Promise((resolve, reject) => {
        sqliteDb.run(
          'DELETE FROM todos WHERE id = ? AND userId = ?',
          [todoId, userId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    },

    // Appointments
    getAppointmentsByUserId: (userId) => {
      return new Promise((resolve, reject) => {
        sqliteDb.all(
          'SELECT * FROM appointments WHERE userId = ? ORDER BY date, time',
          [userId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    },

    getAppointmentsByDate: (date) => {
      return new Promise((resolve, reject) => {
        sqliteDb.all(
          'SELECT * FROM appointments WHERE date = ?',
          [date],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    },

    createAppointment: (userId, date, time) => {
      return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString();
        sqliteDb.run(
          'INSERT INTO appointments (userId, date, time, createdAt) VALUES (?, ?, ?, ?)',
          [userId, date, time, createdAt],
          function(err) {
            if (err) {
              if (err.code === 'SQLITE_CONSTRAINT') {
                reject(new Error('Time slot already booked'));
              } else {
                reject(err);
              }
            } else {
              resolve({ id: this.lastID, userId, date, time, createdAt });
            }
          }
        );
      });
    },

    deleteAppointment: (appointmentId, userId) => {
      return new Promise((resolve, reject) => {
        sqliteDb.run(
          'DELETE FROM appointments WHERE id = ? AND userId = ?',
          [appointmentId, userId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    },

    // Contacts
    createContact: (name, email, message) => {
      return new Promise((resolve, reject) => {
        const createdAt = new Date().toISOString();
        sqliteDb.run(
          'INSERT INTO contacts (name, email, message, createdAt) VALUES (?, ?, ?, ?)',
          [name, email, message, createdAt],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, name, email, message, createdAt });
          }
        );
      });
    },

    getAllContacts: () => {
      return new Promise((resolve, reject) => {
        sqliteDb.all(
          'SELECT * FROM contacts ORDER BY createdAt DESC',
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
    },

    getContactById: (contactId) => {
      return new Promise((resolve, reject) => {
        sqliteDb.get(
          'SELECT * FROM contacts WHERE id = ?',
          [contactId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    }
  };
}

// For backward compatibility - export both db and init function
const init = () => {
  console.log('Database initialized');
};

module.exports = { db, init };
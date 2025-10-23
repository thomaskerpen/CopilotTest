const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('./db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Registrierung
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username und Passwort erforderlich' });
  }
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (user) {
      return res.status(409).json({ error: 'Benutzername bereits vergeben' });
    }
    const passwordHash = bcrypt.hashSync(password, 8);
    db.run('INSERT INTO users (username, passwordHash) VALUES (?, ?)', [username, passwordHash], function(err) {
      if (err) return res.status(500).json({ error: 'DB-Fehler' });
      res.status(201).json({ success: true });
    });
  });
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'User nicht gefunden' });
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Falsches Passwort' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  });
});

module.exports = router;

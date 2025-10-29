const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('./db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Registrierung
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username und Passwort erforderlich' });
    }

    // Check if user already exists
    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Benutzername bereits vergeben' });
    }

    // Create new user
    const passwordHash = bcrypt.hashSync(password, 8);
    await db.createUser(username, passwordHash);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'DB-Fehler' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ error: 'User nicht gefunden' });
    }

    // Handle both 'password' and 'passwordHash' field names for backward compatibility
    const hashedPassword = user.password || user.passwordHash;
    
    if (!hashedPassword) {
      console.error('No password hash found for user:', user);
      return res.status(500).json({ error: 'Password hash missing' });
    }

    if (!bcrypt.compareSync(password, hashedPassword)) {
      return res.status(401).json({ error: 'Falsches Passwort' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server-Fehler' });
  }
});

module.exports = router;

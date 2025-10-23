const express = require('express');
const cors = require('cors');
const { init } = require('../server/db');
const userRoutes = require('../server/userRoutes');
const todoRoutes = require('../server/todoRoutes');
const appointmentRoutes = require('../server/appointmentRoutes');
const contactRoutes = require('../server/contactRoutes');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Initialize database
init();

// CORS for all origins in production
app.use(cors());
app.use(express.json());

// Auth-Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token fehlt' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token ungültig' });
    req.user = user;
    next();
  });
}

// Routes
app.use('/', userRoutes);
app.use('/todos', authenticateToken, todoRoutes);
app.use('/appointments', authenticateToken, appointmentRoutes);
app.use('/contacts', contactRoutes);

module.exports = app;
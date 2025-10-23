
const express = require('express');
const cors = require('cors');
const { init } = require('./db');
const userRoutes = require('./userRoutes');
const todoRoutes = require('./todoRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const contactRoutes = require('./contactRoutes');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow all origins in production for easier setup
    : true  // Allow all origins in development (for local network access)
}));
app.use(express.json());

// Initialize database
init();

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

app.use('/api', userRoutes);
app.use('/api/todos', authenticateToken, todoRoutes);
app.use('/api/appointments', authenticateToken, appointmentRoutes);
app.use('/api/contacts', contactRoutes);

// For Vercel, export the app instead of listening
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  const port = process.env.PORT || 5000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

const express = require('express');
const cors = require('cors');
const { init } = require('./db');
const userRoutes = require('./userRoutes');
const todoRoutes = require('./todoRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://*.vercel.app', 'https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001']
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

// For Vercel, export the app instead of listening
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  const port = process.env.PORT || 5000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}
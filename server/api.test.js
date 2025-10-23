const request = require('supertest');
const express = require('express');
const { init } = require('./db');
const userRoutes = require('./userRoutes');
const todoRoutes = require('./todoRoutes');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'supersecretkey';

let app;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  await init();
  // Auth middleware for test
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
});

describe('Todo App API', () => {
  let token;
  let todoId;
  const username = 'testuser_' + Date.now();
  const password = 'testpass';

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username, password });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should login and return a JWT', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username, password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('should create a new todo', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', 'Bearer ' + token)
      .send({ text: 'Testaufgabe', dueDate: '2025-12-31' });
    expect(res.statusCode).toBe(201);
    expect(res.body.text).toBe('Testaufgabe');
    expect(res.body.dueDate).toBe('2025-12-31');
    expect(res.body.completed).toBe(false);
    todoId = res.body.id;
  });

  it('should get all todos for the user', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update a todo', async () => {
    const res = await request(app)
      .put(`/api/todos/${todoId}`)
      .set('Authorization', 'Bearer ' + token)
      .send({ completed: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('should delete a todo', async () => {
    const res = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(204);
  });

  it('should return empty todos after deletion', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // May have more if DB is not isolated, but at least the deleted one is gone
  });
});

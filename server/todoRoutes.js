const express = require('express');
const { db } = require('./db');

const router = express.Router();

// Alle Todos für eingeloggten User
router.get('/', async (req, res) => {
  try {
    const todos = await db.getTodosByUserId(req.user.id);
    res.json(todos.map(todo => ({ ...todo, completed: !!todo.completed })));
  } catch (error) {
    console.error('Fehler beim Laden der Todos:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Todos', details: error.message });
  }
});

// Neues Todo
router.post('/', async (req, res) => {
  try {
    const { text, dueDate } = req.body;
    console.log('POST /api/todos body:', req.body, 'user:', req.user);
    
    if (!text || !dueDate) {
      return res.status(400).json({ error: 'Text und Fälligkeitsdatum erforderlich' });
    }

    const todo = await db.createTodo(req.user.id, text, dueDate);
    res.status(201).json({ ...todo, completed: !!todo.completed });
  } catch (error) {
    console.error('Fehler beim Anlegen des Todos:', error);
    res.status(500).json({ error: 'Fehler beim Anlegen des Todos', details: error.message });
  }
});

// Todo aktualisieren
router.put('/:id', async (req, res) => {
  try {
    const { completed } = req.body;
    const todoId = parseInt(req.params.id);
    
    const updatedTodo = await db.updateTodo(todoId, { completed });
    res.json({ ...updatedTodo, completed: !!updatedTodo.completed });
  } catch (error) {
    console.error('Fehler beim Aktualisieren:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren', details: error.message });
  }
});

// Todo löschen
router.delete('/:id', async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    await db.deleteTodo(todoId, req.user.id);
    res.status(204).send();
  } catch (error) {
    console.error('Fehler beim Löschen:', error);
    res.status(500).json({ error: 'Fehler beim Löschen', details: error.message });
  }
});

module.exports = router;

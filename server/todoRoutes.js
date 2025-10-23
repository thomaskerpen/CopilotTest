const express = require('express');
const { db } = require('./db');

const router = express.Router();

// Alle Todos für eingeloggten User
router.get('/', (req, res) => {
  db.all('SELECT * FROM todos WHERE userId = ?', [req.user.id], (err, rows) => {
    if (err) {
      console.error('Fehler beim Laden der Todos:', err);
      return res.status(500).json({ error: 'Fehler beim Laden der Todos', details: err.message });
    }
    res.json(rows.map(row => ({ ...row, completed: !!row.completed })));
  });
});

// Neues Todo
router.post('/', (req, res) => {
  const { text, dueDate } = req.body;
  console.log('POST /api/todos body:', req.body, 'user:', req.user);
  if (!text || !dueDate) return res.status(400).json({ error: 'Text und Fälligkeitsdatum erforderlich' });
  db.run(
    'INSERT INTO todos (userId, text, dueDate, completed) VALUES (?, ?, ?, 0)',
    [req.user.id, text, dueDate],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: 'Fehler beim Anlegen des Todos',
          details: err.message,
          stack: err.stack
        });
      }
      db.get('SELECT * FROM todos WHERE id = ?', [this.lastID], (err, todo) => {
        if (err) {
          console.error('Fehler beim Lesen des neuen Todos:', err, 'lastID:', this.lastID);
          return res.status(500).json({ error: 'Fehler beim Lesen des neuen Todos', details: err.message });
        }
        res.status(201).json({ ...todo, completed: !!todo.completed });
      });
    }
  );
});

// Todo aktualisieren
router.put('/:id', (req, res) => {
  const { completed, text, dueDate } = req.body;
  db.run(
    'UPDATE todos SET completed = COALESCE(?, completed), text = COALESCE(?, text), dueDate = COALESCE(?, dueDate) WHERE id = ? AND userId = ?',
    [typeof completed === 'boolean' ? (completed ? 1 : 0) : undefined, text, dueDate, req.params.id, req.user.id],
    function (err) {
      if (err) {
        console.error('Fehler beim Aktualisieren:', err);
        return res.status(500).json({ error: 'Fehler beim Aktualisieren', details: err.message });
      }
      db.get('SELECT * FROM todos WHERE id = ?', [req.params.id], (err, todo) => {
        if (err) {
          console.error('Fehler beim Lesen des aktualisierten Todos:', err);
          return res.status(500).json({ error: 'Fehler beim Lesen des aktualisierten Todos', details: err.message });
        }
        res.json({ ...todo, completed: !!todo.completed });
      });
    }
  );
});

// Todo löschen
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM todos WHERE id = ? AND userId = ?', [req.params.id, req.user.id], function (err) {
    if (err) {
      console.error('Fehler beim Löschen:', err);
      return res.status(500).json({ error: 'Fehler beim Löschen', details: err.message });
    }
    res.status(204).send();
  });
});

module.exports = router;

const express = require('express');
const { db } = require('./db');

const router = express.Router();

// Kontaktanfrage senden
router.post('/', (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
  }

  // Einfache E-Mail-Validierung
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
  }

  // Kontaktanfrage in Datenbank speichern
  db.run(
    'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
    [name, email, message],
    function(err) {
      if (err) {
        console.error('Fehler beim Speichern der Kontaktanfrage:', err);
        return res.status(500).json({ error: 'Fehler beim Speichern der Anfrage' });
      }
      
      const contactId = this.lastID;
      
      // Automatisch TODO für Admin-User erstellen
      createAutoTodoForContact(name, email, message, contactId, (todoErr) => {
        if (todoErr) {
          console.error('Fehler beim Erstellen des automatischen TODOs:', todoErr);
          // Trotzdem Erfolg zurückgeben, da die Kontaktanfrage gespeichert wurde
        }
        
        res.status(201).json({ 
          id: contactId,
          message: 'Ihre Anfrage wurde erfolgreich gesendet'
        });
      });
    }
  );
});

// Hilfsfunktion: Automatisches TODO für Kontaktanfrage erstellen
function createAutoTodoForContact(name, email, message, contactId, callback) {
  // Admin-User finden (standardmäßig der erste User oder 'test')
  db.get('SELECT id FROM users WHERE username = ? OR id = 1', ['test'], (err, adminUser) => {
    if (err || !adminUser) {
      console.error('Admin-User nicht gefunden für Auto-TODO');
      return callback(err || new Error('Admin not found'));
    }
    
    // TODO-Text mit Contact-ID für spätere Verknüpfung erstellen
    const shortMessage = message.length > 50 ? message.substring(0, 50) + '...' : message;
    const todoText = `📧 Kontaktanfrage von ${name}: "${shortMessage}" [ID:${contactId}]`;
    const dueDate = new Date().toISOString().slice(0, 10); // Heute als Fälligkeitsdatum
    
    // TODO in Datenbank erstellen
    db.run(
      'INSERT INTO todos (userId, text, dueDate, completed) VALUES (?, ?, ?, 0)',
      [adminUser.id, todoText, dueDate],
      function(todoErr) {
        if (todoErr) {
          console.error('Fehler beim Erstellen des TODOs:', todoErr);
          return callback(todoErr);
        }
        
        console.log(`✅ Automatisches TODO erstellt (ID: ${this.lastID}) für Kontaktanfrage von ${name} (${email})`);
        console.log(`📝 TODO-Text: "${todoText}"`);
        callback(null);
      }
    );
  });
}

// Alle Kontaktanfragen abrufen (Admin-Funktion)
router.get('/', (req, res) => {
  db.all(
    `SELECT c.*, 
            t.id as todo_id, 
            t.completed as todo_completed,
            t.text as todo_text
     FROM contacts c
     LEFT JOIN todos t ON t.text LIKE '%' || c.name || '%' 
                      AND t.text LIKE '%📧%'
     ORDER BY c.createdAt DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Fehler beim Abrufen der Kontaktanfragen:', err);
        return res.status(500).json({ error: 'Fehler beim Laden der Anfragen' });
      }
      res.json(rows);
    }
  );
});

// Einzelne Kontaktanfrage abrufen
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(
    'SELECT * FROM contacts WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        console.error('Fehler beim Abrufen der Kontaktanfrage:', err);
        return res.status(500).json({ error: 'Fehler beim Laden der Anfrage' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Anfrage nicht gefunden' });
      }
      res.json(row);
    }
  );
});

module.exports = router;
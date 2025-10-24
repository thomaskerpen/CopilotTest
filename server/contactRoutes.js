const express = require('express');
const { db } = require('./db');

const router = express.Router();

// Kontaktanfrage senden
router.post('/', async (req, res) => {
  try {
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
    const contact = await db.createContact(name, email, message);
    
    // Automatisch TODO für Admin-User erstellen
    try {
      await createAutoTodoForContact(name, email, message, contact.id);
    } catch (todoErr) {
      console.error('Fehler beim Erstellen des automatischen TODOs:', todoErr);
      // Trotzdem Erfolg zurückgeben, da die Kontaktanfrage gespeichert wurde
    }
    
    res.status(201).json({ 
      id: contact.id,
      message: 'Ihre Anfrage wurde erfolgreich gesendet'
    });
  } catch (error) {
    console.error('Fehler beim Speichern der Kontaktanfrage:', error);
    res.status(500).json({ error: 'Fehler beim Speichern der Anfrage' });
  }
});

// Hilfsfunktion: Automatisches TODO für Kontaktanfrage erstellen
async function createAutoTodoForContact(name, email, message, contactId) {
  try {
    // Admin-User finden (standardmäßig 'test' oder ersten User)
    const adminUser = await db.getUserByUsername('test');
    if (!adminUser) {
      throw new Error('Admin-User nicht gefunden für Auto-TODO');
    }
    
    // TODO-Text mit Contact-ID für spätere Verknüpfung erstellen
    const shortMessage = message.length > 50 ? message.substring(0, 50) + '...' : message;
    const todoText = `📧 Kontaktanfrage von ${name}: "${shortMessage}" [ID:${contactId}]`;
    const dueDate = new Date().toISOString().slice(0, 10); // Heute als Fälligkeitsdatum
    
    // TODO in Datenbank erstellen
    const todo = await db.createTodo(adminUser.id, todoText, dueDate);
    
    console.log(`✅ Automatisches TODO erstellt (ID: ${todo.id}) für Kontaktanfrage von ${name} (${email})`);
    console.log(`📝 TODO-Text: "${todoText}"`);
  } catch (error) {
    console.error('Fehler beim Erstellen des automatischen TODOs:', error);
    throw error;
  }
}

// Alle Kontaktanfragen abrufen (Admin-Funktion)
router.get('/', async (req, res) => {
  try {
    const contacts = await db.getAllContacts();
    res.json(contacts);
  } catch (error) {
    console.error('Fehler beim Abrufen der Kontaktanfragen:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Anfragen' });
  }
});

// Einzelne Kontaktanfrage abrufen
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await db.getContactById(parseInt(id));
    
    if (!contact) {
      return res.status(404).json({ error: 'Anfrage nicht gefunden' });
    }
    
    res.json(contact);
  } catch (error) {
    console.error('Fehler beim Abrufen der Kontaktanfrage:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Anfrage' });
  }
});

module.exports = router;
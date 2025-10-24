const express = require('express');
const { db } = require('./db');

const router = express.Router();

// Verfügbare Zeitslots für ein bestimmtes Datum abrufen
router.get('/available/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Alle möglichen Zeitslots
    const allTimeSlots = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
    
    // Prüfen, welche Zeitslots bereits gebucht sind
    const bookedAppointments = await db.getAppointmentsByDate(date);
    const bookedTimes = bookedAppointments.map(slot => slot.time);
    const availableSlots = allTimeSlots.filter(time => !bookedTimes.includes(time));
    
    res.json({
      date,
      availableSlots,
      bookedSlots: bookedTimes
    });
  } catch (error) {
    console.error('Fehler beim Laden der Termine:', error);
    res.status(500).json({ error: 'Fehler beim Laden der verfügbaren Zeiten' });
  }
});

// Termin buchen
router.post('/', async (req, res) => {
  try {
    const { date, time } = req.body;
    const userId = req.user.id;
    
    if (!date || !time) {
      return res.status(400).json({ error: 'Datum und Zeit sind erforderlich' });
    }
    
    const appointment = await db.createAppointment(userId, date, time);
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Fehler beim Buchen des Termins:', error);
    if (error.message.includes('already booked')) {
      res.status(409).json({ error: 'Dieser Zeitslot ist bereits gebucht' });
    } else {
      res.status(500).json({ error: 'Fehler beim Buchen des Termins' });
    }
  }
});
    db.run(
      'INSERT INTO appointments (userId, date, time) VALUES (?, ?, ?)',
      [userId, date, time],
      function(err) {
        if (err) {
          console.error('Fehler beim Buchen des Termins:', err);
          return res.status(500).json({ error: 'Fehler beim Buchen des Termins' });
        }
        
        res.status(201).json({
          id: this.lastID,
          userId,
          date,
          time,
          message: 'Termin erfolgreich gebucht'
        });
      }
    );
  });
});

// Alle Termine des eingeloggten Users
router.get('/', (req, res) => {
  const userId = req.user.id;
  
  db.all(
    'SELECT * FROM appointments WHERE userId = ? ORDER BY date, time',
    [userId],
    (err, appointments) => {
      if (err) {
        console.error('Fehler beim Laden der Termine:', err);
        return res.status(500).json({ error: 'Fehler beim Laden der Termine' });
      }
      
      res.json(appointments);
    }
  );
});

// Termin löschen
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  db.run(
    'DELETE FROM appointments WHERE id = ? AND userId = ?',
    [id, userId],
    function(err) {
      if (err) {
        console.error('Fehler beim Löschen des Termins:', err);
        return res.status(500).json({ error: 'Fehler beim Löschen des Termins' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Termin nicht gefunden' });
      }
      
      res.status(204).send();
    }
  );
});

module.exports = router;
import React from 'react';
import '../styles/App.css';
import { useBooking } from '../hooks/useBooking';

export default function Booking() {
  const {
    selectedDate,
    selectedTime,
    availableSlots,
    bookedSlots,
    loading,
    myAppointments,
    handleDateChange,
    handleTimeSelect,
    handleBooking,
    handleCancelAppointment,
    isWeekend,
    isPastDate
  } = useBooking();

  return (
    <div className="booking-container">
      <h2>Terminbuchung</h2>
      
      <div className="date-picker-section">
        <label>Datum auswählen:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          min={new Date().toISOString().slice(0, 10)}
          className="date-picker"
        />
        {selectedDate && isWeekend(selectedDate) && (
          <p className="warning">Hinweis: Am Wochenende sind keine Termine verfügbar.</p>
        )}
      </div>

      {selectedDate && !isWeekend(selectedDate) && !isPastDate(selectedDate) && (
        <div className="time-slots-section">
          <h3>Verfügbare Zeiten am {new Date(selectedDate).toLocaleDateString()}:</h3>
          {loading ? (
            <div>Lade verfügbare Zeiten...</div>
          ) : (
            <div className="time-slots-grid">
              {availableSlots.map((time) => (
                <div
                  key={time}
                  className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </div>
              ))}
              {bookedSlots.map((time) => (
                <div
                  key={`booked-${time}`}
                  className="time-slot booked"
                  title="Bereits gebucht"
                >
                  {time} ❌
                </div>
              ))}
            </div>
          )}
          
          {selectedTime && (
            <div className="booking-confirmation">
              <p>Ausgewählter Termin: {new Date(selectedDate).toLocaleDateString()} um {selectedTime} Uhr</p>
              <button onClick={handleBooking} className="book-button" disabled={loading}>
                {loading ? 'Buche...' : 'Termin buchen'}
              </button>
            </div>
          )}
        </div>
      )}

      {myAppointments.length > 0 && (
        <div className="my-appointments">
          <h3>Meine Termine:</h3>
          <div className="appointments-list">
            {myAppointments.map((appointment) => (
              <div key={appointment.id} className="appointment-item">
                <span>{new Date(appointment.date).toLocaleDateString()} um {appointment.time} Uhr</span>
                <button 
                  onClick={() => handleCancelAppointment(appointment.id)}
                  className="cancel-button"
                  disabled={loading}
                  title="Termin stornieren"
                >
                  {loading ? 'Storniere...' : 'Stornieren'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
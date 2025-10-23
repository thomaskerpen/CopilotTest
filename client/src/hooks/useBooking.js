import { useState, useEffect } from 'react';
import { appointmentService } from '../services/api';
import { dateUtils } from '../utils/helpers';

export const useBooking = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myAppointments, setMyAppointments] = useState([]);

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchMyAppointments = async () => {
    try {
      const response = await appointmentService.fetchMyAppointments();
      if (response.ok) {
        const appointments = await response.json();
        setMyAppointments(appointments);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Termine:', error);
    }
  };

  const fetchAvailableSlots = async (date) => {
    setLoading(true);
    try {
      const response = await appointmentService.fetchAvailableSlots(date);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.availableSlots);
        setBookedSlots(data.bookedSlots);
      } else {
        console.error('API error:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Fehler beim Laden verfügbarer Zeiten:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleBooking = async () => {
    if (selectedDate && selectedTime) {
      setLoading(true);
      try {
        const response = await appointmentService.bookAppointment(selectedDate, selectedTime);
        
        if (response.ok) {
          alert(`Termin erfolgreich gebucht für ${dateUtils.formatDateForDisplay(selectedDate)} um ${selectedTime} Uhr`);
          setSelectedTime('');
          fetchAvailableSlots(selectedDate);
          fetchMyAppointments();
        } else if (response.status === 409) {
          alert('Dieser Zeitslot ist bereits gebucht. Bitte wählen Sie einen anderen.');
        } else {
          const error = await response.json();
          alert('Fehler beim Buchen: ' + error.error);
        }
      } catch (error) {
        console.error('Fehler beim Buchen:', error);
        alert('Fehler beim Buchen des Termins');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Möchten Sie diesen Termin wirklich stornieren?')) {
      setLoading(true);
      try {
        const response = await appointmentService.deleteAppointment(appointmentId);
        
        if (response.ok) {
          alert('Termin erfolgreich storniert');
          fetchMyAppointments();
          // Refresh available slots if a date is selected
          if (selectedDate) {
            fetchAvailableSlots(selectedDate);
          }
        } else {
          const error = await response.json();
          alert('Fehler beim Stornieren: ' + error.error);
        }
      } catch (error) {
        console.error('Fehler beim Stornieren:', error);
        alert('Fehler beim Stornieren des Termins');
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    // State
    selectedDate,
    selectedTime,
    availableSlots,
    bookedSlots,
    loading,
    myAppointments,
    
    // Handlers
    handleDateChange,
    handleTimeSelect,
    handleBooking,
    handleCancelAppointment,
    
    // Utilities
    isWeekend: dateUtils.isWeekend,
    isPastDate: dateUtils.isPastDate
  };
};
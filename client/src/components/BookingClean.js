import React from 'react';
import { useBooking } from './hooks/useBooking';
import { 
  DatePicker, 
  TimeSlots, 
  BookingConfirmation, 
  MyAppointments 
} from './components/BookingComponents';
import './App.css';

export default function BookingClean() {
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
    isWeekend,
    isPastDate
  } = useBooking();

  return (
    <div className="booking-container">
      <h2>Terminbuchung</h2>
      
      <DatePicker 
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
        isWeekend={isWeekend}
      />

      <TimeSlots 
        selectedDate={selectedDate}
        isWeekend={isWeekend}
        isPastDate={isPastDate}
        loading={loading}
        availableSlots={availableSlots}
        bookedSlots={bookedSlots}
        selectedTime={selectedTime}
        handleTimeSelect={handleTimeSelect}
      />

      <BookingConfirmation 
        selectedTime={selectedTime}
        selectedDate={selectedDate}
        handleBooking={handleBooking}
        loading={loading}
      />

      <MyAppointments myAppointments={myAppointments} />
    </div>
  );
}
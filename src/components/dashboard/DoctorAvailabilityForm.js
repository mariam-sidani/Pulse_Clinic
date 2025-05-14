'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorAvailabilityForm({ doctorId, clinicId, token }) {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([
    { start_time: '09:00', end_time: '09:30' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const addSlot = () => {
    const lastSlot = slots[slots.length - 1];
    
    // Calculate the next slot time (30 minutes after the last end time)
    const lastEndTime = lastSlot.end_time;
    const [hours, minutes] = lastEndTime.split(':').map(Number);
    
    let newStartHours = hours;
    let newStartMinutes = minutes;
    
    let newEndHours = hours;
    let newEndMinutes = minutes + 30;
    
    if (newEndMinutes >= 60) {
      newEndHours += 1;
      newEndMinutes -= 60;
    }
    
    const newStartTime = `${newStartHours.toString().padStart(2, '0')}:${newStartMinutes.toString().padStart(2, '0')}`;
    const newEndTime = `${newEndHours.toString().padStart(2, '0')}:${newEndMinutes.toString().padStart(2, '0')}`;
    
    setSlots([...slots, { start_time: newStartTime, end_time: newEndTime }]);
  };

  const removeSlot = (index) => {
    const newSlots = [...slots];
    newSlots.splice(index, 1);
    setSlots(newSlots);
  };

  const handleStartTimeChange = (index, value) => {
    const newSlots = [...slots];
    newSlots[index].start_time = value;
    setSlots(newSlots);
  };

  const handleEndTimeChange = (index, value) => {
    const newSlots = [...slots];
    newSlots[index].end_time = value;
    setSlots(newSlots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      // Format the slots with the selected date
      const formattedSlots = slots.map(slot => ({
        date,
        start_time: slot.start_time + ':00',
        end_time: slot.end_time + ':00'
      }));

      const response = await fetch('/api/appointment-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          clinic_id: clinicId,
          slots: formattedSlots
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Availability slots added successfully!');
        // Reset form
        setSlots([{ start_time: '09:00', end_time: '09:30' }]);
        // Refresh the page to show updated availability
        router.refresh();
      } else {
        setError(data.message || 'Failed to add availability slots');
      }
    } catch (error) {
      setError('An error occurred while adding availability slots');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Add Availability</h2>
      
      {message && (
        <div className="p-3 bg-green-100 text-green-800 rounded mb-4">
          {message}
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Time Slots</label>
          
          {slots.map((slot, index) => (
            <div key={index} className="flex items-center mb-2">
              <input 
                type="time" 
                value={slot.start_time} 
                onChange={(e) => handleStartTimeChange(index, e.target.value)}
                className="p-2 border rounded mr-2"
                required
              />
              <span className="mx-2">to</span>
              <input 
                type="time" 
                value={slot.end_time} 
                onChange={(e) => handleEndTimeChange(index, e.target.value)}
                className="p-2 border rounded mr-2"
                required
              />
              {slots.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeSlot(index)}
                  className="p-2 text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={addSlot}
            className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded"
          >
            + Add Another Slot
          </button>
        </div>
        
        <button 
          type="submit" 
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Availability'}
        </button>
      </form>
    </div>
  );
} 
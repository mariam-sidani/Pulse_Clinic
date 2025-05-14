import { NextResponse } from 'next/server';

/**
 * Test endpoint to add availability for Dr. John Doe (doctor_id: 1)
 * This is just a convenience endpoint for testing, not for production use
 */
export async function GET(request) {
  try {
    const baseUrl = new URL(request.url).origin;
    const appointmentSlotsEndpoint = `${baseUrl}/api/appointment-slots`;
    
    // Example data for adding availability
    const testData = {
      doctor_id: 1,
      clinic_id: 1,
      slots: [
        {
          date: '2024-07-01',
          start_time: '09:00:00',
          end_time: '09:30:00'
        },
        {
          date: '2024-07-01',
          start_time: '09:30:00',
          end_time: '10:00:00'
        },
        {
          date: '2024-07-01',
          start_time: '10:00:00',
          end_time: '10:30:00'
        },
        {
          date: '2024-07-01',
          start_time: '10:30:00',
          end_time: '11:00:00'
        }
      ]
    };
    
    // In a real environment, we'd get the token from the session
    // For test purposes, we're using the known admin token
    // Note: This is a test endpoint only - don't use hard-coded tokens in production
    const token = 'test_token_for_admin'; // Replace with actual authentication token
    
    const response = await fetch(appointmentSlotsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({
        message: 'Error adding availability slots',
        error: data.message,
        status: response.status
      }, { status: response.status });
    }
    
    return NextResponse.json({
      message: 'Successfully added availability slots',
      result: data
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { message: 'An error occurred while testing the appointment slots API' },
      { status: 500 }
    );
  }
} 
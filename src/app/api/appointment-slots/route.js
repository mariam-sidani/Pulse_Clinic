import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

/**
 * Get available appointment slots, with optional filtering
 * @param {Request} request - The request object
 * @returns {Promise<NextResponse>} - The response
 */
export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctor_id');
    const clinicId = searchParams.get('clinic_id');
    const date = searchParams.get('date');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    // Base query
    let query = `
      SELECT s.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name,
      c.name as clinic_name
      FROM appointment_slots s
      JOIN doctors d ON s.doctor_id = d.doctor_id
      JOIN clinics c ON s.clinic_id = c.clinic_id
      WHERE s.is_booked = 0
    `;
    
    // Parameters for the query
    const queryParams = [];
    
    // Add filters if provided
    if (doctorId) {
      query += ' AND s.doctor_id = ?';
      queryParams.push(doctorId);
    }
    
    if (clinicId) {
      query += ' AND s.clinic_id = ?';
      queryParams.push(clinicId);
    }
    
    if (date) {
      query += ' AND s.slot_date = ?';
      queryParams.push(date);
    } else if (startDate && endDate) {
      query += ' AND s.slot_date BETWEEN ? AND ?';
      queryParams.push(startDate, endDate);
    } else if (startDate) {
      query += ' AND s.slot_date >= ?';
      queryParams.push(startDate);
    } else if (endDate) {
      query += ' AND s.slot_date <= ?';
      queryParams.push(endDate);
    }
    
    // Add order by
    query += ' ORDER BY s.slot_date, s.start_time ASC';
    
    // Execute query
    const slots = await executeQuery({
      query,
      values: queryParams,
    });
    
    return NextResponse.json({
      slots
    });
  } catch (error) {
    console.error('Get appointment slots error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching appointment slots' },
      { status: 500 }
    );
  }
}

/**
 * Create new appointment slots for a doctor
 * @param {Request} request - The request object
 * @returns {Promise<NextResponse>} - The response
 */
export async function POST(request) {
  try {
    // Authenticate the request
    const authHeader = request.headers.get('authorization');
    let userId = null;
    let userRole = 0;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = await verifyToken(token);
        userId = decoded.id;
        userRole = decoded.role;
      } catch (error) {
        return NextResponse.json(
          { message: 'Invalid or expired token' },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }
    
    // Only doctors or admins can add appointment slots
    if (userRole !== 1 && userRole !== 2) {
      return NextResponse.json(
        { message: 'Unauthorized to add appointment slots' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { 
      doctor_id, 
      clinic_id, 
      slots 
    } = body;
    
    // Validate required fields
    if (!doctor_id || !clinic_id || !slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { message: 'Missing required fields or invalid slots array' },
        { status: 400 }
      );
    }
    
    // If user is a doctor, verify they're adding slots for themselves
    if (userRole === 2) {
      const doctorQuery = `
        SELECT * FROM doctors
        WHERE user_id = ?
      `;
      
      const doctors = await executeQuery({
        query: doctorQuery,
        values: [userId],
      });
      
      if (doctors.length === 0 || doctors[0].doctor_id !== parseInt(doctor_id)) {
        return NextResponse.json(
          { message: 'You can only add slots for yourself' },
          { status: 403 }
        );
      }
    }
    
    // Verify the doctor exists
    const doctorVerifyQuery = `
      SELECT * FROM doctors WHERE doctor_id = ?
    `;
    
    const doctorResult = await executeQuery({
      query: doctorVerifyQuery,
      values: [doctor_id],
    });
    
    if (doctorResult.length === 0) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    // Verify the clinic exists
    const clinicVerifyQuery = `
      SELECT * FROM clinics WHERE clinic_id = ?
    `;
    
    const clinicResult = await executeQuery({
      query: clinicVerifyQuery,
      values: [clinic_id],
    });
    
    if (clinicResult.length === 0) {
      return NextResponse.json(
        { message: 'Clinic not found' },
        { status: 404 }
      );
    }
    
    // Verify the doctor works at this clinic
    const doctorClinicQuery = `
      SELECT * FROM clinic_doctor 
      WHERE doctor_id = ? AND clinic_id = ?
    `;
    
    const doctorClinicResult = await executeQuery({
      query: doctorClinicQuery,
      values: [doctor_id, clinic_id],
    });
    
    if (doctorClinicResult.length === 0) {
      return NextResponse.json(
        { message: 'Doctor does not work at the specified clinic' },
        { status: 400 }
      );
    }
    
    // Create the insert query for slots
    const insertQuery = `
      INSERT INTO appointment_slots 
      (doctor_id, clinic_id, slot_date, start_time, end_time, is_booked)
      VALUES ?
    `;
    
    // Prepare values for batch insert
    const values = slots.map(slot => [
      doctor_id, 
      clinic_id,
      slot.date,
      slot.start_time,
      slot.end_time,
      0 // Not booked
    ]);
    
    // Execute the batch insert
    const result = await executeQuery({
      query: insertQuery,
      values: [values],
      isMultiple: true
    });
    
    return NextResponse.json({
      message: 'Appointment slots created successfully',
      count: result.affectedRows
    });
  } catch (error) {
    console.error('Create appointment slots error:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating appointment slots' },
      { status: 500 }
    );
  }
} 
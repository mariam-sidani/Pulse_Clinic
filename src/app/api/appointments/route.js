import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

/**
 * Get all appointments, with optional filtering
 * @param {Request} request - The request object
 * @returns {Promise<NextResponse>} - The response
 */
export async function GET(request) {
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
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    
    // Base query depends on user role
    let query = '';
    const queryParams = [];
    
    if (userRole === 1) {
      // Admin can see all appointments
      query = `
        SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
        d.first_name as doctor_first_name, d.last_name as doctor_last_name,
        s.slot_date, s.start_time, s.end_time, c.name as clinic_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.patient_id
        JOIN appointment_slots s ON a.slot_id = s.slot_id
        JOIN doctors d ON s.doctor_id = d.doctor_id
        JOIN clinics c ON s.clinic_id = c.clinic_id
      `;
    } else if (userRole === 2) {
      // Doctor can only see their appointments
      query = `
        SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
        s.slot_date, s.start_time, s.end_time, c.name as clinic_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.patient_id
        JOIN appointment_slots s ON a.slot_id = s.slot_id
        JOIN doctors d ON s.doctor_id = d.doctor_id
        JOIN clinics c ON s.clinic_id = c.clinic_id
        WHERE d.user_id = ?
      `;
      queryParams.push(userId);
    } else if (userRole === 3) {
      // Patient can only see their appointments
      query = `
        SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name,
        s.slot_date, s.start_time, s.end_time, c.name as clinic_name
        FROM appointments a
        JOIN appointment_slots s ON a.slot_id = s.slot_id
        JOIN doctors d ON s.doctor_id = d.doctor_id
        JOIN clinics c ON s.clinic_id = c.clinic_id
        JOIN patients p ON a.patient_id = p.patient_id
        WHERE p.user_id = ?
      `;
      queryParams.push(userId);
    } else {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Add filters if provided
    const whereClause = userRole === 1 ? 'WHERE' : 'AND';
    
    if (date) {
      query += ` ${userRole === 1 ? whereClause : 'AND'} s.slot_date = ?`;
      queryParams.push(date);
    }
    
    if (status) {
      query += ` ${userRole === 1 && !date ? whereClause : 'AND'} a.status = ?`;
      queryParams.push(status);
    }
    
    // Add order by
    query += ' ORDER BY s.slot_date, s.start_time ASC';
    
    // Execute query
    const appointments = await executeQuery({
      query,
      values: queryParams,
    });
    
    return NextResponse.json({
      appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching appointments' },
      { status: 500 }
    );
  }
}

/**
 * Create a new appointment
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
    
    // Only patients or admins can book appointments
    if (userRole !== 1 && userRole !== 3) {
      return NextResponse.json(
        { message: 'Unauthorized to book appointments' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { slot_id, patient_id, notes } = body;
    
    // Validate required fields
    if (!slot_id || !patient_id) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if the slot is available
    const slotQuery = `
      SELECT * FROM appointment_slots
      WHERE slot_id = ? AND is_booked = 0
    `;
    
    const slots = await executeQuery({
      query: slotQuery,
      values: [slot_id],
    });
    
    if (slots.length === 0) {
      return NextResponse.json(
        { message: 'The selected appointment slot is not available' },
        { status: 400 }
      );
    }
    
    // If user is a patient, verify they're booking for themselves
    if (userRole === 3) {
      const patientQuery = `
        SELECT * FROM patients
        WHERE patient_id = ? AND user_id = ?
      `;
      
      const patients = await executeQuery({
        query: patientQuery,
        values: [patient_id, userId],
      });
      
      if (patients.length === 0) {
        return NextResponse.json(
          { message: 'You can only book appointments for yourself' },
          { status: 403 }
        );
      }
    }
    
    // Create the appointment
    const insertQuery = `
      INSERT INTO appointments (patient_id, slot_id, notes, status)
      VALUES (?, ?, ?, 'Scheduled')
    `;
    
    const result = await executeQuery({
      query: insertQuery,
      values: [patient_id, slot_id, notes || null],
    });
    
    // Mark the slot as booked
    const updateSlotQuery = `
      UPDATE appointment_slots
      SET is_booked = 1
      WHERE slot_id = ?
    `;
    
    await executeQuery({
      query: updateSlotQuery,
      values: [slot_id],
    });
    
    return NextResponse.json({
      message: 'Appointment booked successfully',
      appointment_id: result.insertId
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { message: 'An error occurred while booking the appointment' },
      { status: 500 }
    );
  }
} 
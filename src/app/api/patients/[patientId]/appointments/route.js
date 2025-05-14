import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

/**
 * Get all appointments for a specific patient
 * @param {Request} request - The request object
 * @param {Object} params - Route parameters
 * @param {string} params.patientId - The patient ID
 * @returns {Promise<NextResponse>} - The response
 */
export async function GET(request, { params }) {
  try {
    const { patientId } = params;
    
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
    
    // Verify access rights (only admins, doctors with appointments with this patient, or the patient themselves)
    if (userRole !== 1) {
      if (userRole === 3) {
        // Verify the patient is accessing their own appointments
        const patientCheckQuery = `
          SELECT * FROM patients
          WHERE patient_id = ? AND user_id = ?
        `;
        
        const patientCheck = await executeQuery({
          query: patientCheckQuery,
          values: [patientId, userId],
        });
        
        if (patientCheck.length === 0) {
          return NextResponse.json(
            { message: 'Unauthorized to access this patient\'s appointments' },
            { status: 403 }
          );
        }
      } else if (userRole === 2) {
        // For doctors, verify they have appointments with this patient
        const doctorCheckQuery = `
          SELECT a.* FROM appointments a
          JOIN appointment_slots s ON a.slot_id = s.slot_id
          JOIN doctors d ON s.doctor_id = d.doctor_id
          WHERE a.patient_id = ? AND d.user_id = ?
          LIMIT 1
        `;
        
        const doctorCheck = await executeQuery({
          query: doctorCheckQuery,
          values: [patientId, userId],
        });
        
        if (doctorCheck.length === 0) {
          return NextResponse.json(
            { message: 'Unauthorized to access this patient\'s appointments' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { message: 'Unauthorized to access patient appointments' },
          { status: 403 }
        );
      }
    }
    
    // Base query
    let query = `
      SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name,
      s.slot_date, s.start_time, s.end_time, c.name as clinic_name
      FROM appointments a
      JOIN appointment_slots s ON a.slot_id = s.slot_id
      JOIN doctors d ON s.doctor_id = d.doctor_id
      JOIN clinics c ON s.clinic_id = c.clinic_id
      WHERE a.patient_id = ?
    `;
    
    // Parameters for the query
    const queryParams = [patientId];
    
    // Add filters if provided
    if (date) {
      query += ' AND s.slot_date = ?';
      queryParams.push(date);
    }
    
    if (status) {
      query += ' AND a.status = ?';
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
    console.error('Get patient appointments error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching patient appointments' },
      { status: 500 }
    );
  }
} 
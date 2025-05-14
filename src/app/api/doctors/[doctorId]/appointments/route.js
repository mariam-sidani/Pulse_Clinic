import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

/**
 * Get all appointments for a specific doctor
 * @param {Request} request - The request object
 * @param {Object} params - Route parameters
 * @param {string} params.doctorId - The doctor ID
 * @returns {Promise<NextResponse>} - The response
 */
export async function GET(request, { params }) {
  try {
    const { doctorId } = params;
    
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
    
    // Verify access rights (only admins, the doctor themselves, or patients with appointments with this doctor)
    if (userRole !== 1) {
      if (userRole === 2) {
        // Verify the doctor is accessing their own appointments
        const doctorCheckQuery = `
          SELECT * FROM doctors
          WHERE doctor_id = ? AND user_id = ?
        `;
        
        const doctorCheck = await executeQuery({
          query: doctorCheckQuery,
          values: [doctorId, userId],
        });
        
        if (doctorCheck.length === 0) {
          return NextResponse.json(
            { message: 'Unauthorized to access this doctor\'s appointments' },
            { status: 403 }
          );
        }
      } else {
        // For patients, they can only see basic info about a doctor's availability
        // but not detailed appointment information
        return NextResponse.json(
          { message: 'Unauthorized to access detailed doctor appointments' },
          { status: 403 }
        );
      }
    }
    
    // Base query
    let query = `
      SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name,
      s.slot_date, s.start_time, s.end_time, c.name as clinic_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN appointment_slots s ON a.slot_id = s.slot_id
      JOIN clinics c ON s.clinic_id = c.clinic_id
      WHERE s.doctor_id = ?
    `;
    
    // Parameters for the query
    const queryParams = [doctorId];
    
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
    console.error('Get doctor appointments error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching doctor appointments' },
      { status: 500 }
    );
  }
} 
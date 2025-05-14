import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

/**
 * Get the current doctor's information based on their auth token
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
    
    // Only doctors can access this endpoint
    if (userRole !== 2) {
      return NextResponse.json(
        { message: 'Access denied. Only doctors can access this endpoint' },
        { status: 403 }
      );
    }
    
    // Query to get doctor information
    const query = `
      SELECT d.*, s.specialty_name, u.email
      FROM doctors d
      JOIN specialties s ON d.specialty_id = s.specialty_id
      JOIN users u ON d.user_id = u.user_id
      WHERE d.user_id = ?
    `;
    
    const doctorResult = await executeQuery({
      query,
      values: [userId],
    });
    
    if (doctorResult.length === 0) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    const doctor = doctorResult[0];
    
    // Get doctor's clinics
    const clinicsQuery = `
      SELECT c.*
      FROM clinics c
      JOIN clinic_doctor cd ON c.clinic_id = cd.clinic_id
      WHERE cd.doctor_id = ?
    `;
    
    const clinicsResult = await executeQuery({
      query: clinicsQuery,
      values: [doctor.doctor_id],
    });
    
    // Return the doctor's information
    return NextResponse.json({
      doctor: {
        ...doctor,
        clinics: clinicsResult
      }
    });
  } catch (error) {
    console.error('Get doctor info error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching doctor information' },
      { status: 500 }
    );
  }
} 
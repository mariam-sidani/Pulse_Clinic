import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

/**
 * Get all doctors, optionally filtered by specialty
 * @param {Request} request - The request object
 * @returns {Promise<NextResponse>} - The response
 */
export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');
    const specialtyId = searchParams.get('specialty_id');
    const limit = parseInt(searchParams.get('limit')) || 100; // Default to 100
    
    // Base query
    let query = `
      SELECT d.*, s.specialty_name, u.email
      FROM doctors d
      JOIN specialties s ON d.specialty_id = s.specialty_id
      JOIN users u ON d.user_id = u.user_id
    `;
    
    // Parameters for the query
    const queryParams = [];
    
    // Add filters if provided
    let whereClause = '';
    
    if (specialty) {
      whereClause = 'WHERE s.specialty_name LIKE ?';
      queryParams.push(`%${specialty}%`);
    } else if (specialtyId) {
      whereClause = 'WHERE s.specialty_id = ?';
      queryParams.push(specialtyId);
    }
    
    // Complete the query with limit
    query = `${query} ${whereClause} ORDER BY d.last_name, d.first_name ASC LIMIT ?`;
    queryParams.push(limit);
    
    // Execute query
    const doctors = await executeQuery({
      query,
      values: queryParams,
    });
    
    return NextResponse.json({
      doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching doctors' },
      { status: 500 }
    );
  }
} 
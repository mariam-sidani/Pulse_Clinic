import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// Get all specialties
export async function GET() {
  try {
    // Query to get all specialties
    const query = 'SELECT * FROM specialties ORDER BY specialty_name ASC';
    
    // Execute query
    const specialties = await executeQuery({
      query,
      values: [],
    });
    
    return NextResponse.json({
      specialties
    });
  } catch (error) {
    console.error('Get specialties error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching specialties' },
      { status: 500 }
    );
  }
} 
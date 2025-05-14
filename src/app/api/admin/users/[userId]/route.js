import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

// Middleware to check admin role
async function isAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role_id !== 1) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
}

// Get user by ID
export async function GET(request, { params }) {
  try {
    // Check if the request is from an admin
    const adminCheck = await isAdmin(request);
    
    if (!adminCheck) {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    const userId = params.userId;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get user data with role-specific details
    const query = `
      SELECT 
        u.user_id, 
        u.email, 
        u.role_id, 
        u.is_active,
        u.is_verified,
        u.created_at,
        r.role,
        CASE 
          WHEN u.role_id = 1 THEN 'Admin'
          WHEN u.role_id = 2 THEN CONCAT(d.first_name, ' ', d.last_name)
          WHEN u.role_id = 3 THEN CONCAT(p.first_name, ' ', p.last_name)
          ELSE NULL
        END AS full_name,
        CASE 
          WHEN u.role_id = 2 THEN d.first_name
          WHEN u.role_id = 3 THEN p.first_name
          ELSE NULL
        END AS first_name,
        CASE 
          WHEN u.role_id = 2 THEN d.last_name
          WHEN u.role_id = 3 THEN p.last_name
          ELSE NULL
        END AS last_name,
        CASE 
          WHEN u.role_id = 2 THEN d.gender
          WHEN u.role_id = 3 THEN p.gender
          ELSE NULL
        END AS gender,
        CASE 
          WHEN u.role_id = 2 THEN d.phone
          WHEN u.role_id = 3 THEN p.phone
          ELSE NULL
        END AS phone,
        CASE 
          WHEN u.role_id = 2 THEN d.license_number
          ELSE NULL
        END AS license_number,
        CASE 
          WHEN u.role_id = 2 THEN d.specialty_id
          ELSE NULL
        END AS specialty_id,
        CASE 
          WHEN u.role_id = 2 THEN s.specialty_name
          ELSE NULL
        END AS specialty_name,
        CASE 
          WHEN u.role_id = 2 THEN d.qualifications
          ELSE NULL
        END AS qualifications,
        CASE 
          WHEN u.role_id = 2 THEN d.experience_years
          ELSE NULL
        END AS experience_years,
        CASE 
          WHEN u.role_id = 2 THEN d.profile_picture
          WHEN u.role_id = 3 THEN p.profile_picture
          ELSE NULL
        END AS profile_picture
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN doctors d ON u.user_id = d.user_id AND u.role_id = 2
      LEFT JOIN patients p ON u.user_id = p.user_id AND u.role_id = 3
      LEFT JOIN specialties s ON d.specialty_id = s.specialty_id
      WHERE u.user_id = ?
    `;
    
    const users = await executeQuery({
      query,
      values: [userId],
    });
    
    if (users.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return user data
    return NextResponse.json({
      user: users[0]
    });
  } catch (error) {
    console.error('Get user details error:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching user details' },
      { status: 500 }
    );
  }
} 
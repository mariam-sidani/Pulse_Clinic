import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    // Get token from query parameters
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Verify the token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const { user_id, email } = decoded;
    
    // Check if user exists
    const users = await executeQuery({
      query: 'SELECT * FROM users WHERE user_id = ? AND email = ?',
      values: [user_id, email],
    });
    
    if (users.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = users[0];
    
    // Check if already verified
    if (user.is_verified === 1) {
      return NextResponse.json({
        message: 'Email already verified',
        success: true
      });
    }
    
    // Update user's verification status
    await executeQuery({
      query: 'UPDATE users SET is_verified = 1 WHERE user_id = ?',
      values: [user_id],
    });
    
    return NextResponse.json({
      message: 'Email verified successfully',
      success: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: 'An error occurred during email verification' },
      { status: 500 }
    );
  }
} 
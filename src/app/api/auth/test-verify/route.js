import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request) {
  try {
    // Only allow this in development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { message: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const users = await executeQuery({
      query: 'SELECT * FROM users WHERE email = ?',
      values: [email],
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
        message: 'Your clinic account is already verified. You can now log in to your clinic dashboard.',
        success: true
      });
    }
    
    // Update user's verification status
    // In a production environment, this would send an email with a link
    // that the user would click to verify their account.
    // For development purposes, we directly mark the account as verified.
    await executeQuery({
      query: 'UPDATE users SET is_verified = 1 WHERE email = ?',
      values: [email],
    });
    
    return NextResponse.json({
      message: 'Your clinic account has been verified successfully. You can now log in to your clinic dashboard.',
      success: true,
      note: 'In a production environment, a verification email would be sent instead of direct verification.'
    });
  } catch (error) {
    console.error('Test verification error:', error);
    return NextResponse.json(
      { message: 'An error occurred during email verification', error: error.message },
      { status: 500 }
    );
  }
} 
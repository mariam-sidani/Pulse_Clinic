import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { executeQuery } from '@/lib/db';
import { createToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
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
        { message: 'User not found', error: 'USER_NOT_FOUND' },
        { status: 401 }
      );
    }
    
    const user = users[0];
    
    // Check if email is verified
    if (user.is_verified === 0) {
      return NextResponse.json(
        { message: 'Email not verified', error: 'EMAIL_NOT_VERIFIED' },
        { status: 401 }
      );
    }
    
    // Check if the account is active
    if (user.is_active === 0) {
      return NextResponse.json(
        { message: 'Account inactive', error: 'ACCOUNT_INACTIVE' },
        { status: 401 }
      );
    }
    
    // Verify password (with additional debugging info)
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    // For debugging purposes only
    const rawStoredPasswordHash = user.password;
    
    if (!isValidPassword) {
      return NextResponse.json(
        { 
          message: 'Invalid password', 
          error: 'INVALID_PASSWORD',
          debug: {
            providedPassword: password,
            passwordLength: password.length,
            storedHashLength: rawStoredPasswordHash.length,
            storedHashFirstFewChars: rawStoredPasswordHash.substring(0, 10) + '...'
          }
        },
        { status: 401 }
      );
    }
    
    // Get user details based on role
    let roleData = null;
    let firstName = null;
    let lastName = null;
    
    if (user.role_id === 1) { // Admin role
      firstName = 'Admin';
      lastName = '';
    } else if (user.role_id === 2) { // Doctor role
      const doctors = await executeQuery({
        query: 'SELECT * FROM doctors WHERE user_id = ?',
        values: [user.user_id],
      });
      
      if (doctors.length > 0) {
        roleData = doctors[0];
        firstName = doctors[0].first_name;
        lastName = doctors[0].last_name;
      }
    } else if (user.role_id === 3) { // Patient role
      const patients = await executeQuery({
        query: 'SELECT * FROM patients WHERE user_id = ?',
        values: [user.user_id],
      });
      
      if (patients.length > 0) {
        roleData = patients[0];
        firstName = patients[0].first_name;
        lastName = patients[0].last_name;
      }
    }
    
    // Create JWT token
    const token = createToken({
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
    });
    
    // Return user data with token
    return NextResponse.json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        email: user.email,
        role_id: user.role_id,
        first_name: firstName,
        last_name: lastName,
        token,
      },
    });
  } catch (error) {
    console.error('Test login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login test', error: error.message },
      { status: 500 }
    );
  }
} 
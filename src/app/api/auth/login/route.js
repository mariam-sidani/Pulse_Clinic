import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { executeQuery } from '@/lib/db';
import { createToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    console.log('Login API: Processing request');
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      console.log('Login API: Missing email or password');
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    console.log('Login API: Checking credentials for', email);
    
    // Check if user exists
    const users = await executeQuery({
      query: 'SELECT * FROM users WHERE email = ?',
      values: [email],
    });
    
    if (users.length === 0) {
      console.log('Login API: User not found', email);
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    const user = users[0];
    
    // Check if email is verified (we'll add this column to the users table)
    if (user.is_verified === 0) {
      console.log('Login API: Email not verified', email);
      return NextResponse.json(
        { message: 'Please verify your email before logging in' },
        { status: 401 }
      );
    }
    
    // Check if the account is active
    if (user.is_active === 0) {
      console.log('Login API: Account inactive', email);
      return NextResponse.json(
        { message: 'Your account has been deactivated' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('Login API: Invalid password', email);
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    console.log('Login API: Password verified for', email);
    
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
    const tokenData = {
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
    };
    
    console.log('Login API: Creating token with data:', tokenData);
    const token = createToken(tokenData);
    
    // Set the token as an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60 * 24, // 1 day
      path: '/' 
    });
    
    console.log('Login API: Token set in cookies');
    
    // Return user data with token
    const userData = {
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
      first_name: firstName,
      last_name: lastName,
      token,
    };
    
    console.log('Login API: Login successful for', email);
    
    return NextResponse.json({
      message: 'Login successful',
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 
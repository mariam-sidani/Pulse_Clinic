import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { executeQuery } from '@/lib/db';
import { createToken } from '@/lib/jwt';
import { sendVerificationEmail } from '@/lib/email';
import validator from 'validator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, dateOfBirth, gender, phone } = body;
    
    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Required fields are missing' },
        { status: 400 }
      );
    }
    
    // Validate email format
    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUsers = await executeQuery({
      query: 'SELECT * FROM users WHERE email = ?',
      values: [email],
    });
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Begin transaction
    const connection = await require('mysql2/promise').createConnection({
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || 3306,
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'pulse',
    });
    
    try {
      await connection.beginTransaction();
      
      // Create user with role_id 3 (Patient)
      const [userResult] = await connection.execute(
        'INSERT INTO users (email, password, role_id, is_active, is_verified) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, 3, 1, 1] // is_verified set to 1 initially
      );
      
      const userId = userResult.insertId;
      
      // Create patient record
      await connection.execute(
        'INSERT INTO patients (user_id, first_name, last_name, date_of_birth, gender, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, firstName, lastName, dateOfBirth || null, gender || null, phone || null]
      );
      
      await connection.commit();
      
      // Create verification token
      const verificationToken = createToken(
        { user_id: userId, email },
        '24h'
      );
      
      // Send verification email
      await sendVerificationEmail(email, verificationToken);
      
      return NextResponse.json({
        message: 'User registered successfully. Please check your email to verify your account.',
        user_id: userId,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.end();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 
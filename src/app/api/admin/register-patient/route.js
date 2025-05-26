import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { executeQuery } from '@/lib/db';
import { createToken } from '@/lib/jwt';
import { sendVerificationEmail } from '@/lib/email';
import validator from 'validator';
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

export async function POST(request) {
  try {
    // Check if the request is from an admin
    const adminCheck = await isAdmin(request);
    
    if (!adminCheck) {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { 
      email, 
      password,
      firstName, 
      lastName, 
      dateOfBirth,
      gender, 
      phone, 
      address,
      bio,
      medicalHistory,
      emergencyContactName,
      emergencyContactPhone,
      bloodType
    } = body;
    
    // Validate input
    if (!email || !password || !firstName || !lastName || !dateOfBirth || !gender) {
      return NextResponse.json(
        { message: 'Required fields are missing (email, password, firstName, lastName, dateOfBirth, gender)' },
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

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Validate date of birth
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    if (birthDate >= today) {
      return NextResponse.json(
        { message: 'Date of birth must be in the past' },
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
    
    // Hash the provided password
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
        `INSERT INTO patients 
          (user_id, first_name, last_name, date_of_birth, gender, phone, address, bio, medical_history, emergency_contact_name, emergency_contact_phone, blood_type) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          firstName, 
          lastName, 
          dateOfBirth,
          gender, 
          phone || null, 
          address || null,
          bio || null,
          medicalHistory || null,
          emergencyContactName || null,
          emergencyContactPhone || null,
          bloodType || null
        ]
      );
      
      await connection.commit();
      
      // Create verification token
      const verificationToken = createToken(
        { user_id: userId, email },
        '72h'
      );
      
      // Send verification email with temporary password
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a5568; text-align: center;">Welcome to Pulse Clinic!</h2>
          <p style="color: #4a5568;">You have been registered as a patient in our system. Please use the following temporary password to log in:</p>
          <p style="background-color: #f7fafc; padding: 10px; font-family: monospace; font-size: 16px; text-align: center;">${password}</p>
          <p style="color: #4a5568;">Please click the button below to verify your email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify?token=${verificationToken}" style="background-color: #9f7aea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
          </div>
          <p style="color: #718096; font-size: 14px; margin-top: 30px;">Please change your password after your first login for security reasons.</p>
          <div style="margin-top: 30px; padding: 20px; background-color: #f0fff4; border-left: 4px solid #68d391;">
            <h3 style="color: #2d3748; margin-top: 0;">Your Account Information:</h3>
            <p style="color: #4a5568; margin: 5px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p style="color: #4a5568; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="color: #4a5568; margin: 5px 0;"><strong>Role:</strong> Patient</p>
          </div>
        </div>
      `;
      
      // Send email with temporary password
      await sendVerificationEmail(email, verificationToken, emailContent);
      
      return NextResponse.json({
        message: 'Patient registered successfully. Verification email sent with temporary password.',
        user_id: userId,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.end();
    }
  } catch (error) {
    console.error('Patient registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during patient registration' },
      { status: 500 }
    );
  }
} 
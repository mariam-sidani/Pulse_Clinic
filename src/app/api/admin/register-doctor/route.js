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
      firstName, 
      lastName, 
      gender, 
      phone, 
      licenseNumber, 
      specialtyId,
      qualifications,
      experienceYears
    } = body;
    
    // Validate input
    if (!email || !firstName || !lastName || !specialtyId || !licenseNumber) {
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
    
    // Check if specialty exists
    const specialties = await executeQuery({
      query: 'SELECT * FROM specialties WHERE specialty_id = ?',
      values: [specialtyId],
    });
    
    if (specialties.length === 0) {
      return NextResponse.json(
        { message: 'Specialty not found' },
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
    
    // Generate a random password
    const randomPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    
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
      
      // Create user with role_id 2 (Doctor)
      const [userResult] = await connection.execute(
        'INSERT INTO users (email, password, role_id, is_active, is_verified) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, 2, 1, 0] // is_verified set to 0 initially
      );
      
      const userId = userResult.insertId;
      
      // Create doctor record
      await connection.execute(
        `INSERT INTO doctors 
          (user_id, first_name, last_name, gender, phone, license_number, specialty_id, qualifications, experience_years) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          firstName, 
          lastName, 
          gender || null, 
          phone || null, 
          licenseNumber,
          specialtyId,
          qualifications || null,
          experienceYears || null
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
          <p style="color: #4a5568;">You have been registered as a doctor in our system. Please use the following temporary password to log in:</p>
          <p style="background-color: #f7fafc; padding: 10px; font-family: monospace; font-size: 16px; text-align: center;">${randomPassword}</p>
          <p style="color: #4a5568;">Please click the button below to verify your email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify?token=${verificationToken}" style="background-color: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
          </div>
          <p style="color: #718096; font-size: 14px; margin-top: 30px;">Please change your password after your first login for security reasons.</p>
        </div>
      `;
      
      // Send email with temporary password
      await sendVerificationEmail(email, verificationToken, emailContent);
      
      return NextResponse.json({
        message: 'Doctor registered successfully. Verification email sent with temporary password.',
        user_id: userId,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.end();
    }
  } catch (error) {
    console.error('Doctor registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during doctor registration' },
      { status: 500 }
    );
  }
} 
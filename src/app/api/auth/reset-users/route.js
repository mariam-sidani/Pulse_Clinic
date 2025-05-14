import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { executeQuery } from '@/lib/db';

export async function POST(request) {
  try {
    // Check secret key from environment variable
    const { secretKey } = await request.json();
    const validSecretKey = process.env.RESET_USERS_SECRET_KEY || 'temp_reset_key';
    
    if (secretKey !== validSecretKey) {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
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
      
      // 1. Delete associated records first (respect foreign key constraints)
      await connection.execute('DELETE FROM doctor_patient_files');
      await connection.execute('DELETE FROM doctor_calendar');
      await connection.execute('DELETE FROM clinic_doctor');
      await connection.execute('DELETE FROM appointments');
      await connection.execute('DELETE FROM appointment_slots');
      await connection.execute('DELETE FROM patients');
      await connection.execute('DELETE FROM doctors');
      await connection.execute('DELETE FROM user_files');
      
      // 2. Now delete all users
      await connection.execute('DELETE FROM users');
      
      // 3. Create the three user accounts with bcrypt hashed passwords
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create Admin user
      const [adminResult] = await connection.execute(
        'INSERT INTO users (email, password, role_id, is_active, is_verified, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        ['asidani88@gmail.com', hashedPassword, 1, 1, 1] // Admin role (1), active and verified
      );
      
      // Create Doctor user
      const [doctorResult] = await connection.execute(
        'INSERT INTO users (email, password, role_id, is_active, is_verified, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        ['developer.sidani@gmail.com', hashedPassword, 2, 1, 1] // Doctor role (2), active and verified
      );
      
      // Insert doctor details
      await connection.execute(
        'INSERT INTO doctors (user_id, first_name, last_name, gender, phone, license_number, bio, specialty_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [doctorResult.insertId, 'John', 'Doe', 'Male', '5551234567', 'DOC12345', 'Experienced physician with a focus on patient care', 1]
      );
      
      // Create Patient user
      const [patientResult] = await connection.execute(
        'INSERT INTO users (email, password, role_id, is_active, is_verified, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        ['a.sidani@bitstudios.it', hashedPassword, 3, 1, 1] // Patient role (3), active and verified
      );
      
      // Insert patient details
      await connection.execute(
        'INSERT INTO patients (user_id, first_name, last_name, date_of_birth, gender, phone, blood_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [patientResult.insertId, 'Jane', 'Smith', '1990-05-15', 'Female', '5559876543', 'O+']
      );
      
      await connection.commit();
      
      return NextResponse.json({
        message: 'Users reset successfully',
        users: [
          { email: 'asidani88@gmail.com', role: 'Admin', password: 'password123' },
          { email: 'developer.sidani@gmail.com', role: 'Doctor', password: 'password123' },
          { email: 'a.sidani@bitstudios.it', role: 'Patient', password: 'password123' }
        ]
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.end();
    }
  } catch (error) {
    console.error('Reset users error:', error);
    return NextResponse.json(
      { message: 'An error occurred during user reset', error: error.message },
      { status: 500 }
    );
  }
} 
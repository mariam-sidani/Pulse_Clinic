import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { verifyToken, decodeToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';
import validator from 'validator';

// Middleware to check admin role
async function isAdmin(request) {
  try {
    // Check if token is present in cookies (server-side auth)
    let token = null;
    
    // First try to get token from authorization header (client-side requests)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('[isAdmin] Found token in Authorization header', { 
        tokenLength: token?.length,
        tokenStart: token ? token.substring(0, 10) + '...' : 'null'
      });
    } else {
      console.log('[isAdmin] No valid authorization header found', {
        headerExists: !!authHeader,
        headerValue: authHeader ? `${authHeader.substring(0, 20)}...` : 'null'
      });
    }
    
    // If no token in header, try cookies (for server-side requests)
    if (!token) {
      console.log('[isAdmin] No token in header, checking cookies');
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        console.log('[isAdmin] Cookie header found');
        // Simple cookie parser
        const tokenCookie = cookieHeader.split(';')
          .map(cookie => cookie.trim())
          .find(cookie => cookie.startsWith('token='));
          
        if (tokenCookie) {
          token = tokenCookie.substring(6); // 'token='.length
          console.log('[isAdmin] Found token in cookies', { 
            tokenLength: token?.length,
            tokenStart: token ? token.substring(0, 10) + '...' : 'null'
          });
        } else {
          console.log('[isAdmin] No token cookie found in header');
        }
      } else {
        console.log('[isAdmin] No cookie header found');
      }
    }
    
    if (!token) {
      console.log('[isAdmin] No token found in any source');
      return { authorized: false, reason: 'No authentication token provided' };
    }
    
    console.log('[isAdmin] Verifying token...');
    
    // First try to just decode the token (without verification) to check its format
    const decodedTokenInfo = decodeToken(token);
    if (!decodedTokenInfo) {
      console.log('[isAdmin] Token could not be decoded, invalid format');
      return { authorized: false, reason: 'Invalid token format' };
    }
    
    console.log('[isAdmin] Token decode info:', { 
      hasPayload: !!decodedTokenInfo,
      userId: decodedTokenInfo?.user_id,
      role: decodedTokenInfo?.role_id,
      exp: decodedTokenInfo?.exp,
      expDate: decodedTokenInfo?.exp ? new Date(decodedTokenInfo.exp * 1000).toISOString() : null,
      now: new Date().toISOString(),
      isExpired: decodedTokenInfo?.exp ? (decodedTokenInfo.exp < Math.floor(Date.now() / 1000)) : null
    });
    
    // Now try to verify the token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log('[isAdmin] Token verification failed');
      const expiredMessage = decodedTokenInfo?.exp && (decodedTokenInfo.exp < Math.floor(Date.now() / 1000)) 
        ? 'Token has expired' 
        : 'Invalid token';
      return { authorized: false, reason: expiredMessage };
    }
    
    console.log('[isAdmin] Token verification successful:', { 
      userId: decoded?.user_id, 
      role: decoded?.role_id 
    });
    
    if (decoded.role_id !== 1) {
      console.log('[isAdmin] User is not an admin:', { role: decoded.role_id });
      return { authorized: false, reason: 'Not authorized for admin access' };
    }
    
    console.log('[isAdmin] Admin verified successfully');
    return { authorized: true };
  } catch (error) {
    console.error('[isAdmin] Verification error:', error);
    return { authorized: false, reason: `Authorization error: ${error.message}` };
  }
}

export async function GET(request) {
  try {
    console.log('Admin users API: Request received', { 
      url: request.url, 
      hasAuth: !!request.headers.get('authorization'),
      cookie: !!request.headers.get('cookie')
    });
    
    // Check if the request is from an admin
    const adminCheck = await isAdmin(request);
    
    if (!adminCheck.authorized) {
      console.log(`Admin users API: Unauthorized access attempt - ${adminCheck.reason}`);
      return NextResponse.json(
        { message: `Unauthorized access: ${adminCheck.reason}` },
        { status: 401 }
      );
    }
    
    // Get query parameters for pagination and filtering
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const roleFilter = url.searchParams.get('role');
    const searchQuery = url.searchParams.get('search');
    
    try {
      // Use direct connection instead of the pool
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        port: process.env.DATABASE_PORT || 3306,
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'clinic_agent_app',
      });
      
      console.log('Admin users API: Database connected directly');

      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Build the query based on filters
      let query = 'SELECT user_id, email, role_id, is_active, is_verified, created_at FROM users WHERE 1=1';
      const queryParams = [];
      
      // Add role filter if provided
      if (roleFilter) {
        query += ' AND role_id = ?';
        queryParams.push(parseInt(roleFilter));
      }
      
      // Add search filter if provided
      if (searchQuery) {
        query += ' AND (email LIKE ? OR user_id LIKE ?)';
        queryParams.push(`%${searchQuery}%`);
        queryParams.push(`%${searchQuery}%`);
      }
      
      // Add pagination
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(limit);
      queryParams.push(offset);
      
      console.log('Admin users API: Executing query:', { query, params: queryParams });
      
      // Execute the query
      const [rows] = await connection.execute(query, queryParams);
      
      console.log('Admin users API: Query executed, found users:', rows.length);
      
      // Get roles for each user
      for (const user of rows) {
        const [roleRows] = await connection.execute(
          'SELECT role FROM roles WHERE role_id = ?',
          [user.role_id]
        );
        
        if (roleRows.length > 0) {
          user.role = roleRows[0].role;
        } else {
          user.role = 'Unknown';
        }
        
        // Set default empty name fields
        user.firstName = '';
        user.lastName = '';
      }
      
      // Build count query with the same filters (but without pagination)
      let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
      const countParams = [];
      
      if (roleFilter) {
        countQuery += ' AND role_id = ?';
        countParams.push(parseInt(roleFilter));
      }
      
      if (searchQuery) {
        countQuery += ' AND (email LIKE ? OR user_id LIKE ?)';
        countParams.push(`%${searchQuery}%`);
        countParams.push(`%${searchQuery}%`);
      }
      
      // Get count for pagination
      const [countRows] = await connection.execute(countQuery, countParams);
      const totalCount = countRows[0].total;
      const totalPages = Math.ceil(totalCount / limit);
      
      // Close connection
      await connection.end();
      
      console.log('Admin users API: Success, returning response', { 
        totalCount, 
        totalPages 
      });
      
      return NextResponse.json({
        users: rows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      });
    } catch (dbError) {
      console.error('Admin users API: Database error:', dbError);
      return NextResponse.json(
        { message: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Admin users API: Unhandled error:', error);
    return NextResponse.json(
      { message: `An error occurred while fetching users: ${error.message}` },
      { status: 500 }
    );
  }
}

// Create a new user (admin or doctor)
export async function POST(request) {
  try {
    // Check if the request is from an admin
    const adminCheck = await isAdmin(request);
    
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { message: `Unauthorized access: ${adminCheck.reason}` },
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
      gender,
      phone,
      role_id,
      specialty_id,
      license_number,
      qualifications,
      experience_years
    } = body;
    
    // Basic validation
    if (!email || !firstName || !lastName || !role_id || !password) {
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
    
    // Validate role (only admin=1 or doctor=2 are allowed to be created by admin)
    if (role_id !== 1 && role_id !== 2) {
      return NextResponse.json(
        { message: 'Invalid role. Admins can only create Admins or Doctors' },
        { status: 400 }
      );
    }
    
    // Validate doctor-specific fields
    if (role_id === 2) {
      if (!specialty_id || !license_number) {
        return NextResponse.json(
          { message: 'Specialty and license number are required for doctors' },
          { status: 400 }
        );
      }
      
      // Check if specialty exists
      const specialties = await executeQuery({
        query: 'SELECT * FROM specialties WHERE specialty_id = ?',
        values: [specialty_id],
      });
      
      if (specialties.length === 0) {
        return NextResponse.json(
          { message: 'Specialty not found' },
          { status: 400 }
        );
      }
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
      
      // Create user
      const [userResult] = await connection.execute(
        'INSERT INTO users (email, password, role_id, is_active, is_verified) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, role_id, 1, 1] // Active and verified by default when created by admin
      );
      
      const userId = userResult.insertId;
      
      // Create role-specific record
      if (role_id === 2) { // Doctor
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
            license_number,
            specialty_id,
            qualifications || null,
            experience_years || null
          ]
        );
      }
      
      await connection.commit();
      
      return NextResponse.json({
        message: 'User created successfully',
        user_id: userId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating user' },
      { status: 500 }
    );
  }
}

// Update user
export async function PUT(request) {
  try {
    // Check if the request is from an admin
    const adminCheck = await isAdmin(request);
    
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { message: `Unauthorized access: ${adminCheck.reason}` },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { 
      user_id,
      email, 
      password,
      firstName, 
      lastName, 
      gender,
      phone,
      is_active,
      specialty_id,
      license_number,
      qualifications,
      experience_years
    } = body;
    
    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get existing user
    const existingUsers = await executeQuery({
      query: 'SELECT * FROM users WHERE user_id = ?',
      values: [user_id],
    });
    
    if (existingUsers.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const existingUser = existingUsers[0];
    
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
      
      // Update user table
      const updates = [];
      const updateValues = [];
      
      if (email && email !== existingUser.email) {
        // Validate email format
        if (!validator.isEmail(email)) {
          return NextResponse.json(
            { message: 'Invalid email format' },
            { status: 400 }
          );
        }
        
        // Check if email is already in use
        const emailCheck = await executeQuery({
          query: 'SELECT * FROM users WHERE email = ? AND user_id != ?',
          values: [email, user_id],
        });
        
        if (emailCheck.length > 0) {
          return NextResponse.json(
            { message: 'Email already in use' },
            { status: 409 }
          );
        }
        
        updates.push('email = ?');
        updateValues.push(email);
      }
      
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = ?');
        updateValues.push(hashedPassword);
      }
      
      if (is_active !== undefined) {
        updates.push('is_active = ?');
        updateValues.push(is_active ? 1 : 0);
      }
      
      // Update user if there are changes
      if (updates.length > 0) {
        await connection.execute(
          `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
          [...updateValues, user_id]
        );
      }
      
      // Update role-specific data
      if (existingUser.role_id === 2) { // Doctor
        const doctorUpdates = [];
        const doctorValues = [];
        
        if (firstName) {
          doctorUpdates.push('first_name = ?');
          doctorValues.push(firstName);
        }
        
        if (lastName) {
          doctorUpdates.push('last_name = ?');
          doctorValues.push(lastName);
        }
        
        if (gender) {
          doctorUpdates.push('gender = ?');
          doctorValues.push(gender);
        }
        
        if (phone) {
          doctorUpdates.push('phone = ?');
          doctorValues.push(phone);
        }
        
        if (license_number) {
          doctorUpdates.push('license_number = ?');
          doctorValues.push(license_number);
        }
        
        if (specialty_id) {
          // Check if specialty exists
          const specialties = await executeQuery({
            query: 'SELECT * FROM specialties WHERE specialty_id = ?',
            values: [specialty_id],
          });
          
          if (specialties.length === 0) {
            return NextResponse.json(
              { message: 'Specialty not found' },
              { status: 400 }
            );
          }
          
          doctorUpdates.push('specialty_id = ?');
          doctorValues.push(specialty_id);
        }
        
        if (qualifications) {
          doctorUpdates.push('qualifications = ?');
          doctorValues.push(qualifications);
        }
        
        if (experience_years) {
          doctorUpdates.push('experience_years = ?');
          doctorValues.push(experience_years);
        }
        
        // Update doctor if there are changes
        if (doctorUpdates.length > 0) {
          await connection.execute(
            `UPDATE doctors SET ${doctorUpdates.join(', ')} WHERE user_id = ?`,
            [...doctorValues, user_id]
          );
        }
      } else if (existingUser.role_id === 1) { // Admin doesn't have a profile table
        // No additional profile data for admins
      }
      
      await connection.commit();
      
      return NextResponse.json({
        message: 'User updated successfully'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating user' },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(request) {
  try {
    // Check if the request is from an admin
    const adminCheck = await isAdmin(request);
    
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { message: `Unauthorized access: ${adminCheck.reason}` },
        { status: 401 }
      );
    }
    
    // Get user ID from URL
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get existing user
    const existingUsers = await executeQuery({
      query: 'SELECT * FROM users WHERE user_id = ?',
      values: [userId],
    });
    
    if (existingUsers.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    const existingUser = existingUsers[0];
    
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
      
      // Delete role-specific records
      if (existingUser.role_id === 2) { // Doctor
        // Remove doctor from clinic associations
        await connection.execute('DELETE FROM clinic_doctor WHERE doctor_id IN (SELECT doctor_id FROM doctors WHERE user_id = ?)', [userId]);
        
        // Remove doctor calendar entries
        await connection.execute('DELETE FROM doctor_calendar WHERE doctor_id IN (SELECT doctor_id FROM doctors WHERE user_id = ?)', [userId]);
        
        // Remove appointment slots
        await connection.execute('DELETE FROM appointment_slots WHERE doctor_id IN (SELECT doctor_id FROM doctors WHERE user_id = ?)', [userId]);
        
        // Delete doctor record
        await connection.execute('DELETE FROM doctors WHERE user_id = ?', [userId]);
      } else if (existingUser.role_id === 3) { // Patient
        // Handle patient data deletion if needed (not implemented as per requirements)
      }
      
      // Delete user files
      await connection.execute('DELETE FROM user_files WHERE user_id = ?', [userId]);
      
      // Finally, delete the user
      await connection.execute('DELETE FROM users WHERE user_id = ?', [userId]);
      
      await connection.commit();
      
      return NextResponse.json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting user' },
      { status: 500 }
    );
  }
} 
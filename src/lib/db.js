import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 3306,
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'pulse',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function executeQuery({ query, values = [], isMultiple = false }) {
  try {
    if (isMultiple) {
      // For batch inserts
      const [results] = await pool.query(query, values);
      return results;
    } else {
      // For regular queries
      const [results] = await pool.execute(query, values);
      return results;
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(error.message);
  }
}

export default { executeQuery }; 
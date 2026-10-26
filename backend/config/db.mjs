import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

console.log('Connecting to the database...');

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST || '187.77.125.211',
    user: process.env.DB_USER || 'idzoel',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'capture_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('Connected to the database...');

export default db;
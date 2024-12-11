// src/db.js
const mysql = require('mysql2');

const pool = mysql
    .createPool({
        host: process.env.DB_HOST || '127.0.0.1', // Use environment variables
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'my_database',
    }).promise();

module.exports = pool;
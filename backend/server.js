const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MySQL Database Connection Pooling
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10, // Adjust based on your needs
});

// Database Connection Test
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Successfully connected to MySQL database');
  connection.release();
});

// Route to get all users
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ 
        error: 'Database query error', 
        details: err.message 
      });
    }
    res.json(results);
  });
});

// Route to add a new user
app.post('/api/users', (req, res) => {
  const { name, description } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  db.query(
    'INSERT INTO users (name, description) VALUES (?, ?)', 
    [name, description], 
    (err, results) => {
      if (err) {
        console.error('Failed to insert data:', err);
        return res.status(500).json({ 
          error: 'Failed to insert data', 
          details: err.message 
        });
      }
      res.status(201).json({ 
        message: 'User added successfully', 
        id: results.insertId 
      });
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
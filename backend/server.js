const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',  // MySQL host
  user: 'my_user',    // MySQL username
  password: 'password', // MySQL password
  database: 'my_database', // MySQL database name
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL!');
  }
});

// Example route to get data from the database
app.get('/api/data', (req, res) => {
  db.query('SELECT * FROM your_table', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database query error' });
    } else {
      res.json(results);  // Send results back to the frontend
    }
  });
});

// Example route to add data to the database
app.post('/api/data', (req, res) => {
  const { name, description } = req.body;
  db.query('INSERT INTO your_table (name, description) VALUES (?, ?)', [name, description], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to insert data' });
    } else {
      res.json({ message: 'Data added successfully', data: req.body });
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

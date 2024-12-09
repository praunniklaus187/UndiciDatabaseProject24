// src/routes/employeeLoginRoutes.js
const express = require('express');
const path = require('path');
const db = require('../db');

const router = express.Router();

// Serve the employee login page
router.get('/employee', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'employee.html'));
});

// Handle employee login
router.post('/employee/login', (req, res) => {
    const { employee_id, password } = req.body;

    if (!employee_id || !password) {
        return res.status(400).send('Please provide both Employee ID and password.');
    }

    const query = 'SELECT EMPLOYEE_ID, PASSWORD, ROLE FROM EMPLOYEE WHERE EMPLOYEE_ID = ?';
    db.query(query, [employee_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error.');
        }

        if (results.length === 0) {
            // No employee found
            return res.status(401).send('Invalid Employee ID or Password.');
        }

        const employee = results[0];

        // Check password (no hashing in this example)
        if (employee.PASSWORD !== password) {
            return res.status(401).send('Invalid Employee ID or Password.');
        }

        // Check role and redirect accordingly
        if (employee.ROLE === 'admin') {
            return res.redirect('/employee/admin');
        } else {
            return res.redirect('/employee/home');
        }
    });
});

module.exports = router;

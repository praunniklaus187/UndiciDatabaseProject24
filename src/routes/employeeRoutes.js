const express = require('express');
const path = require('path');
const employeeController = require('../controllers/employeeController'); // Import the controller

const router = express.Router();

// Serve the employee login page
router.get('/employee', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'employee.html'));
});

router.get('/employee/storage', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/storage.html'));
});

// Handle employee login
router.post('/employee/login', employeeController.handleLogin);

module.exports = router;

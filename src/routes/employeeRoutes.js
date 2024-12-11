const express = require('express');
const path = require('path');
const employeeController = require('../controllers/employeeController'); // Import the controller

const router = express.Router();

// Serve the employee login page
router.get('/employee', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'employee.html'));
});

// Handle employee login
router.post('/employee/login', employeeController.handleLogin);

// Serve employee home/dashboard
router.get('/employee/home', employeeController.showDashboard);

// Handle completing an order
router.post('/employee/handle-order', employeeController.handleOrder);

// Serve the admin dashboard
router.get('/employee/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'admin.html'));
});

module.exports = router;

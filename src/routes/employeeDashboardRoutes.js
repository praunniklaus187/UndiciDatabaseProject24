const express = require('express');
const employeeController = require('../controllers/employeeController');
const path = require('path');

const router = express.Router();

// Serve the HTML dashboard file
router.get('/employee/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/employeeDashboard.html'));
});

// API route to fetch unfinished orders
router.get('/api/employee/orders', employeeController.showDashboard);

// Handle order completion
router.post('/employee/handle-order', employeeController.handleOrder);

module.exports = router;

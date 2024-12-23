const express = require('express');
const path = require('path');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

router.get('/employee', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'employee.html'));
});

router.get('/employee/storage', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/storage.html'));
});

router.post('/employee/login', employeeController.handleLogin);

module.exports = router;

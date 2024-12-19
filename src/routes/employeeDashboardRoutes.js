const express = require('express');
const employeeController = require('../controllers/employeeController');
const path = require('path');

const router = express.Router();

router.get('/employee/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/employeeDashboard.html'));
});

router.get('/api/employee/orders', employeeController.showDashboard);

router.post('/employee/handle-order', employeeController.handleOrder);

module.exports = router;

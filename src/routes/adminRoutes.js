const express = require('express');
const path = require('path');
const adminController = require('../controllers/adminController'); // Import the controller

const router = express.Router();

router.get('/employee/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin.html'));
});

// Define routes and connect them to the controller
router.post('/api/admin/add-employee', adminController.addEmployee);
router.post('/api/admin/add-branch', adminController.addBranch);
router.post('/api/admin/add-menu-item', adminController.addMenuItem);
router.get('/api/admin/get-ingredients', adminController.getIngredients);
router.post('/api/admin/give-promotion', adminController.givePromotion);


module.exports = router;

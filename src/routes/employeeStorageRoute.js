const express = require('express');
const storageController = require('../controllers/storageController');

const router = express.Router();


router.get('/api/employee/storage', storageController.getStorageData);
router.get('/api/employee/storage/branches', storageController.getBranches);




module.exports = router;

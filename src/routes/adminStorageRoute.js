const express = require('express');
const storageController = require('../controllers/storageController');
const path = require('path');

const router = express.Router();

router.get('/admin/storage', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'adminStorage.html'));
});

router.get('/api/admin/storage/branches', storageController.getBranches);

router.get('/api/admin/storage/filter', storageController.getFilteredStorage);

router.post('/api/admin/storage/update', storageController.updateStorage);

router.get('/api/admin/storage', storageController.viewStorage);

router.post('/api/admin/order-ingredients', storageController.orderIngredients);

router.get('/api/admin/storage', storageController.getStorage);


module.exports = router;

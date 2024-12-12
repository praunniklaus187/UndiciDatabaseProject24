const express = require('express');
const storageController = require('../controllers/storageController');
const path = require('path'); // Import the path module

const router = express.Router();

// Serve the admin storage HTML page
router.get('/admin/storage', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'adminStorage.html'));
});

// Fetch branches
router.get('/api/admin/storage/branches', storageController.getBranches);

// Fetch storage data filtered by branch
router.get('/api/admin/storage/filter', storageController.getFilteredStorage);

// Update storage
router.post('/api/admin/storage/update', storageController.updateStorage);

// View all storage
router.get('/api/admin/storage', storageController.viewStorage);

// Place an order for new ingredients
router.post('/api/admin/order-ingredients', storageController.orderIngredients);

router.get('/api/admin/storage', storageController.getStorage);
// Fetch storage data filtered by branch


module.exports = router;

const express = require('express');
const path = require('path');
const productsController = require('../controllers/productsController'); // Link to the controller

const router = express.Router();

// Get the list of products (pizzas)
router.get('/products', productsController.getProducts);



// TODO: DO WE NEED THESE ENDPOINTS?
// Serve the static HTML interface (optional)
router.get('/interface', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'interface.html'));
});

// Fetch data from any table dynamically (for admin purposes)
router.get('/table/:tableName', productsController.getTableData);

module.exports = router;

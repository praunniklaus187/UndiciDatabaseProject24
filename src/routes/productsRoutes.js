const express = require('express');
const path = require('path');
const productsController = require('../controllers/productsController');

const router = express.Router();

// Get the list of products
router.get('/products', productsController.getProducts);



router.get('/interface', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'interface.html'));
});

router.get('/table/:tableName', productsController.getTableData);

module.exports = router;

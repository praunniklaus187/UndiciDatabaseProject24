const express = require('express');
const path = require('path');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Serve the order page
router.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/order.html'));
});

// Handle order submission
router.post('/order', orderController.handleOrderSubmission);

// Thank you page
router.get('/order/thankyou', (req, res) => {
    res.send('Thank you for your order! It will approximately take 30 minutes to deliver your order.');
});

module.exports = router;

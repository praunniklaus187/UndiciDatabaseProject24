const express = require('express');
const path = require('path');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/order.html'));
});

router.post('/order', orderController.handleOrderSubmission);

router.get('/order/thankyou', (req, res) => {
    res.send('Thank you for your order! It will approximately take 30 minutes to deliver your order.');
});

module.exports = router;

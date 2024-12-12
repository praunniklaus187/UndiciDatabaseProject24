const express = require('express');
const customerController = require('../controllers/customerController');
const path = require('path');

const router = express.Router();

// Serve the signup HTML page
router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
});

// Handle signup via API
router.post('/api/signup', customerController.signup);

module.exports = router;

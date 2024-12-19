const express = require('express');
const customerController = require('../controllers/customerController');
const path = require('path');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
});

router.post('/api/signup', customerController.signup);

module.exports = router;

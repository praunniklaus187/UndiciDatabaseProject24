// src/routes/productsRoutes.js
const express = require('express');
const db = require('../db');
const path = require('path');

const router = express.Router();

// Get the list of products (pizzas)
router.get('/products', (req, res) => {
    const query = 'SELECT PRODUCT_ID, NAME, DESCRIPTION, PRICE FROM PRODUCT';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database query failed.');
        } else {
            res.json(results);
        }
    });
});

// Serve the static HTML interface (optional)
router.get('/interface', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'interface.html'));
});

// Fetch data from any table dynamically (for admin purposes)
router.get('/table/:tableName', (req, res) => {
    const tableName = req.params.tableName;
    const query = `SELECT * FROM ??`;
    db.query(query, [tableName], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database query failed');
        } else {
            res.json(results);
        }
    });
});

module.exports = router;

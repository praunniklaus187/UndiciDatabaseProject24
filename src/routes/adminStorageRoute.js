const express = require('express');
const path = require('path');
const db = require('../db');

const router = express.Router();

router.get('/admin/storage', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/adminStorage.html')); // Ensure the path is correct
});

// Add storage route (Admin only)
router.post('/api/admin/add-storage', (req, res) => {
    const branch_id = req.body.branch_id;

    if (!branch_id) {
        return res.status(400).send('All fields are required to add a product.');
    }

    db.beginTransaction((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Could not start transaction.');
        }

        const storageQuery = `
            INSERT INTO STORAGE (BRANCH_ID)
            VALUES (?)
        `;
        db.query(storageQuery, [branch_id], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error(err);
                    res.status(500).send('Error adding storage.');
                });
            }

            db.commit((err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error(err);
                        res.status(500).send('Error committing transaction.');
                    });
                }
            });
        });
    })

    res.send('Storage added successfully.');
});
router.post('/admin/order-ingredients', (req, res) => {
    const { branch_id, ingredient_id, quantity } = req.body;

    if (!branch_id || !ingredient_id || !quantity) {
        return res.status(400).send('All fields are required (branch, ingredient, quantity).');
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
        return res.status(400).send('Quantity must be a positive number.');
    }

    const updateStorage = `
        INSERT INTO STORAGE (BRANCH_ID, INGREDIENT_ID, QUANTITY)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE QUANTITY = QUANTITY + VALUES(QUANTITY)
    `;

    db.query(updateStorage, [branch_id, ingredient_id, qty], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating storage.');
        }

        res.redirect('/admin/storage');
    });
});

module.exports = router;

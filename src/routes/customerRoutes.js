// src/routes/customerRoutes.js
const express = require('express');
const path = require('path');
const db = require('../db');
const { getNextCustomerId } = require('../helpers/customerHelpers');

const router = express.Router();

// Route to serve the signup page
router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
});

// Handle signup form submission
router.post('/signup', (req, res) => {
    const { name, street_name, house_number, postal_code, city, country } = req.body;

    if (!name || !street_name || !house_number || !postal_code || !city || !country) {
        return res.status(400).send('All fields are required.');
    }

    db.beginTransaction((err) => {
        if (err) throw err;

        getNextCustomerId((err, customer_id) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error generating customer ID.');
            }

            const postalCodeQuery = `
                INSERT IGNORE INTO POSTAL_CODE (POSTAL_CODE, CITY, COUNTRY)
                VALUES (?, ?, ?)
            `;
            db.query(postalCodeQuery, [postal_code, city, country], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error(err);
                        res.status(500).send('Error inserting postal code.');
                    });
                }

                const addressQuery = `
                    INSERT INTO ADDRESS (STREET_NAME, HOUSE_NUMBER, POSTAL_CODE)
                    VALUES (?, ?, ?)
                `;
                db.query(addressQuery, [street_name, house_number, postal_code], (err, results) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error(err);
                            res.status(500).send('Error inserting address.');
                        });
                    }

                    const address_id = results.insertId;

                    const customerQuery = `
                        INSERT INTO CUSTOMER (CUSTOMER_ID, NAME, ADDRESS_ID)
                        VALUES (?, ?, ?)
                    `;
                    db.query(customerQuery, [customer_id, name, address_id], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(err);
                                res.status(500).send('Error inserting customer.');
                            });
                        }

                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error(err);
                                    res.status(500).send('Transaction commit failed.');
                                });
                            }
                            res.send(`Signup successful! Your Customer ID is ${customer_id}.`);
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;

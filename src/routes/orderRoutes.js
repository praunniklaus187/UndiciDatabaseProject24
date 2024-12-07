// src/routes/orderRoutes.js
const express = require('express');
const path = require('path');
const db = require('../db');

const router = express.Router();

// Serve the order page
router.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'order.html'));
});

router.post('/order', (req, res) => {
    const { customer_id, branch_id, products } = req.body;

    if (!customer_id || !branch_id || !Array.isArray(products) || products.length === 0) {
        return res.status(400).send('Invalid order data.');
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).send('Database error starting transaction.');

        const orderQuery = `
            INSERT INTO \`ORDER\` (STATUS, CUSTOMER_ID, BRANCH_ID, ORDER_DATE)
            VALUES ('In Progress', ?, ?, NOW())
        `;
        db.query(orderQuery, [customer_id, branch_id], (err, orderResult) => {
            if (err) {
                return db.rollback(() => {
                    console.error(err);
                    res.status(500).send('Error inserting order.');
                });
            }

            const order_id = orderResult.insertId;

            const orderItems = products.map((p) => [order_id, p.product_id, p.quantity]);
            const orderItemQuery = `
                INSERT INTO ORDER_ITEM (ORDER_ID, PRODUCT_ID, QUANTITY)
                VALUES ?
            `;
            db.query(orderItemQuery, [orderItems], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error(err);
                        res.status(500).send('Error inserting order items.');
                    });
                }

                const productIds = products.map(p => p.product_id);
                const placeholders = productIds.map(() => '?').join(',');
                const productPriceQuery = `
                    SELECT PRODUCT_ID, PRICE FROM PRODUCT WHERE PRODUCT_ID IN (${placeholders})
                `;
                db.query(productPriceQuery, productIds, (err, priceResults) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error(err);
                            res.status(500).send('Error fetching product prices.');
                        });
                    }

                    const priceMap = {};
                    priceResults.forEach((row) => {
                        priceMap[row.PRODUCT_ID] = row.PRICE;
                    });

                    const orderItemPrices = products.map(p => [order_id, p.product_id, priceMap[p.product_id]]);
                    const orderItemPriceQuery = `
                        INSERT INTO ORDER_ITEM_PRICE (ORDER_ID, PRODUCT_ID, PRICE)
                        VALUES ?
                    `;
                    db.query(orderItemPriceQuery, [orderItemPrices], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(err);
                                res.status(500).send('Error inserting order item prices.');
                            });
                        }

                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error(err);
                                    res.status(500).send('Transaction commit failed.');
                                });
                            }
                            return res.redirect('/order/thankyou');
                        });
                    });
                });
            });
        });
    });
});

router.get('/order/thankyou', (req, res) => {
    res.send('Thank you for your order! It will approximately take 30 minutes to deliver your order.')
});

module.exports = router;

// src/routes/employeeDashboardRoutes.js
const express = require('express');
const db = require('../db');

const router = express.Router();


// Employee dashboard page: Show unfinished orders
router.get('/employee/home', (req, res) => {
    const query = `
      SELECT O.ORDER_ID, O.STATUS, O.ORDER_DATE, C.NAME AS CUSTOMER_NAME, B.BRANCH_ID
      FROM \`ORDER\` O
      JOIN CUSTOMER C ON O.CUSTOMER_ID = C.CUSTOMER_ID
      JOIN BRANCH B ON O.BRANCH_ID = B.BRANCH_ID
      WHERE O.STATUS != 'Completed'
      ORDER BY O.ORDER_DATE DESC
    `;
    db.query(query, (err, orders) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database query failed.');
        }

        let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Employee Dashboard</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background: #f9f9f9;
              color: #333;
            }

            header {
              background-color: #ff5733;
              color: white;
              padding: 1.5rem 0;
              font-size: 1.8rem;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .home-button {
              position: absolute;
              left: 1rem;
              background-color: white;
              color: #ff5733;
              border: none;
              padding: 0.5rem 1rem;
              font-size: 1rem;
              font-weight: bold;
              border-radius: 4px;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              transition: background-color 0.3s ease;
            }

            .home-button:hover {
              background-color: #ffded6;
            }

            main {
              max-width: 800px;
              margin: 2rem auto;
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            h1 {
              color: #ff5733;
              font-size: 2rem;
              text-align: center;
              margin-bottom: 1.5rem;
            }

            h2 {
              color: #333;
              font-size: 1.5rem;
              margin-bottom: 1rem;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1.5rem;
            }

            th, td {
              border: 1px solid #ccc;
              padding: 0.5rem;
              text-align: left;
            }

            th {
              background-color: #f0f0f0;
            }

            button {
              background-color: #ff5733;
              color: white;
              border: none;
              cursor: pointer;
              transition: background-color 0.3s ease;
              padding: 0.5rem 1rem;
              border-radius: 4px;
              font-size: 1rem;
            }

            button:hover {
              background-color: #e34f2c;
            }

            footer {
              text-align: center;
              padding: 1rem 0;
              background: #333;
              color: white;
              font-size: 0.9rem;
              margin-top: 2rem;
            }
          </style>
        </head>
        <body>
          <header>
            Employee Dashboard
            <button class="home-button" onclick="window.location.href='http://localhost:3000';">Home</button>
          </header>

          <main>
            <button onClick="location.href = '/employee/storage'">Storage</button>
            <h1>Unfinished Orders</h1>
        `;

        if (orders.length === 0) {
            html += `<p>No unfinished orders at the moment.</p>`;
        } else {
            html += `
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Branch ID</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
            `;

            for (const order of orders) {
                html += `
                <tr>
                  <td>${order.ORDER_ID}</td>
                  <td>${order.CUSTOMER_NAME}</td>
                  <td>${order.BRANCH_ID}</td>
                  <td>${order.STATUS}</td>
                  <td>${order.ORDER_DATE}</td>
                  <td>
                    <form action="/employee/handle-order" method="POST">
                      <input type="hidden" name="order_id" value="${order.ORDER_ID}">
                      <button type="submit">Complete Order</button>
                    </form>
                  </td>
                </tr>
                `;
            }

            html += `
              </tbody>
            </table>
            `;
        }

        html += `
          </main>
          <footer>
            &copy; 2024 Undici. All rights reserved.
          </footer>
        </body>
        </html>
        `;

        res.send(html);
    });
});

module.exports = router;


// Handle completing an order and updating storage
router.post('/employee/handle-order', (req, res) => {
    const {order_id} = req.body;

    if (!order_id) {
        return res.status(400).send('Order ID is required.');
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).send('Error starting transaction.');

        const updateOrderStatusQuery = `
          UPDATE \`ORDER\`
          SET STATUS = 'Completed'
          WHERE ORDER_ID = ?
        `;
        db.query(updateOrderStatusQuery, [order_id], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error(err);
                    res.status(500).send('Error updating order status.');
                });
            }

            const orderItemsQuery = `
                SELECT PRODUCT_ID, QUANTITY
                FROM ORDER_ITEM
                WHERE ORDER_ID = ?
            `;
            db.query(orderItemsQuery, [order_id], (err, orderItems) => {
                if (err) {
                    return db.rollback(() => {
                        console.error(err);
                        res.status(500).send('Error fetching order items.');
                    });
                }

                if (orderItems.length === 0) {
                    // No items, just commit
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(err);
                                res.status(500).send('Error committing transaction.');
                            });
                        }
                        return res.redirect('/employee/home');
                    });
                    return;
                }

                const productIds = orderItems.map(i => i.PRODUCT_ID);
                const placeholders = productIds.map(() => '?').join(',');
                const productIngredientsQuery = `
                  SELECT PRODUCT_ID, INGREDIENT_ID, QUANTITY_REQUIRED
                  FROM PRODUCT_INGREDIENT
                  WHERE PRODUCT_ID IN (${placeholders})
                `;
                db.query(productIngredientsQuery, productIds, (err, productIngredients) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error(err);
                            res.status(500).send('Error fetching product ingredients.');
                        });
                    }

                    const ingredientRequirements = {};
                    orderItems.forEach(item => {
                        const productId = item.PRODUCT_ID;
                        const quantityOrdered = item.QUANTITY;

                        productIngredients
                            .filter(pi => pi.PRODUCT_ID === productId)
                            .forEach(pi => {
                                const totalNeeded = pi.QUANTITY_REQUIRED * quantityOrdered;
                                if (!ingredientRequirements[pi.INGREDIENT_ID]) {
                                    ingredientRequirements[pi.INGREDIENT_ID] = 0;
                                }
                                ingredientRequirements[pi.INGREDIENT_ID] += totalNeeded;
                            });
                    });

                    const branchQuery = `
                      SELECT BRANCH_ID FROM \`ORDER\` WHERE ORDER_ID = ?
                    `;
                    db.query(branchQuery, [order_id], (err, branchResult) => {
                        if (err || branchResult.length === 0) {
                            return db.rollback(() => {
                                console.error(err);
                                res.status(500).send('Error fetching branch for order.');
                            });
                        }

                        const branchId = branchResult[0].BRANCH_ID;
                        const ingredientIds = Object.keys(ingredientRequirements);

                        const updateNextIngredient = (index) => {
                            if (index >= ingredientIds.length) {
                                // All ingredients updated, commit
                                db.commit((err) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            console.error(err);
                                            res.status(500).send('Error committing transaction.');
                                        });
                                    }
                                    return res.redirect('/employee/home');
                                });
                                return;
                            }

                            const ingId = ingredientIds[index];
                            const requiredQty = ingredientRequirements[ingId];

                            const updateStorageQuery = `
                              UPDATE STORAGE
                              SET QUANTITY = QUANTITY - ?
                              WHERE BRANCH_ID = ? AND INGREDIENT_ID = ?
                            `;
                            db.query(updateStorageQuery, [requiredQty, branchId, ingId], (err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error(err);
                                        res.status(500).send('Error updating storage.');
                                    });
                                }
                                updateNextIngredient(index + 1);
                            });
                        };

                        updateNextIngredient(0);
                    });
                });
            });
        });
    });
});

module.exports = router;

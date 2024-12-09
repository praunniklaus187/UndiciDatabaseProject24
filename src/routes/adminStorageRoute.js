// src/routes/adminStorageRoutes.js
const express = require('express');
const path = require('path');
const db = require('../db');

const router = express.Router();

router.get('/employee/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Admin Page</title></head>
        <body>
            <h1>Admin Page</h1>
            <p><a href="/admin/storage">View All Storage</a></p>
            <p><a href="/employee/logout">Logout</a></p>
        </body>
        </html>
    `);
});

router.get('/admin/storage', (req, res) => {
    const selectedBranchId = req.query.branch || null; // Get the branch filter from query parameter

    const baseQuery = `
        SELECT S.BRANCH_ID, S.INGREDIENT_ID, S.QUANTITY, I.NAME AS INGREDIENT_NAME, I.COST
        FROM STORAGE S
        JOIN INGREDIENT I ON S.INGREDIENT_ID = I.INGREDIENT_ID
        ${selectedBranchId ? 'WHERE S.BRANCH_ID = ?' : ''}
        ORDER BY S.BRANCH_ID, I.NAME
    `;

    const queryParams = selectedBranchId ? [selectedBranchId] : [];

    db.query(baseQuery, queryParams, (err, storageItems) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database query failed.');
        }

        const branches = {};
        storageItems.forEach(item => {
            if (!branches[item.BRANCH_ID]) {
                branches[item.BRANCH_ID] = [];
            }
            branches[item.BRANCH_ID].push(item);
        });

        db.query('SELECT BRANCH_ID FROM BRANCH', (err, branchRes) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error fetching branches.');
            }

            db.query('SELECT INGREDIENT_ID, NAME, COST FROM INGREDIENT ORDER BY NAME', (err, ingrRes) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error fetching ingredients.');
                }

                const branchOptions = branchRes.map(branch => `
                    <option value="${branch.BRANCH_ID}" ${branch.BRANCH_ID == selectedBranchId ? 'selected' : ''}>
                        Branch ${branch.BRANCH_ID}
                    </option>
                `).join('');

                let html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8"/>
                  <title>Admin Storage Overview</title>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 2em; }
                    table { border-collapse: collapse; width: 100%; margin-bottom: 2em; }
                    th, td { border: 1px solid #ccc; padding: 0.5em; text-align: left; }
                    th { background: #f0f0f0; }
                    h2 { margin-top: 2em; }
                    form { margin-top: 2em; }
                    a { margin-right: 1em; }
                  </style>
                </head>
                <body>
                  <h1>Admin - All Branches Storage</h1>
                  <p><a href="/employee/admin">Back to Admin Page</a></p>

                  <form method="get" action="/admin/storage">
                    <label for="branch">Filter by Branch:</label>
                    <select name="branch" id="branch">
                      <option value="">All Branches</option>
                      ${branchOptions}
                    </select>
                    <button type="submit">Filter</button>
                  </form>
                `;

                if (Object.keys(branches).length === 0) {
                    html += `<p>No storage data available.</p>`;
                } else {
                    for (const branchId in branches) {
                        html += `<h2>Branch ${branchId}</h2>`;
                        html += `
                        <table>
                          <tr>
                            <th>Ingredient ID</th>
                            <th>Ingredient Name</th>
                            <th>Quantity</th>
                            <th>Cost (per unit)</th>
                          </tr>
                        `;
                        for (const item of branches[branchId]) {
                            html += `
                            <tr>
                              <td>${item.INGREDIENT_ID}</td>
                              <td>${item.INGREDIENT_NAME}</td>
                              <td>${item.QUANTITY}</td>
                              <td>${item.COST}</td>
                            </tr>
                            `;
                        }
                        html += `</table>`;
                    }
                }

                // Form to order new ingredients
                html += `
                <h2>Order New Ingredients</h2>
                <form action="/admin/order-ingredients" method="POST">
                  <label for="branch_id">Branch:</label>
                  <select name="branch_id" id="branch_id">
                `;
                branchRes.forEach(b => {
                    html += `<option value="${b.BRANCH_ID}">Branch ${b.BRANCH_ID}</option>`;
                });
                html += `</select><br/><br/>`;

                html += `
                  <label for="ingredient_id">Ingredient:</label>
                  <select name="ingredient_id" id="ingredient_id" onchange="updateCost()">
                `;
                ingrRes.forEach(i => {
                    html += `<option value="${i.INGREDIENT_ID}" data-cost="${i.COST}">${i.NAME} (Cost: ${i.COST})</option>`;
                });
                html += `</select><br/><br/>`;

                html += `
                  <label for="quantity">Quantity to order:</label>
                  <input type="number" step="0.01" name="quantity" id="quantity" value="10" oninput="updateCost()" /><br/><br/>
                  <div>Total Cost: <span id="total_cost"></span></div><br/>
                  <button type="submit">Order</button>
                </form>

                <script>
                  const ingrSelect = document.getElementById('ingredient_id');
                  const qtyInput = document.getElementById('quantity');
                  const totalCostSpan = document.getElementById('total_cost');

                  function updateCost() {
                    const selectedOption = ingrSelect.options[ingrSelect.selectedIndex];
                    const cost = parseFloat(selectedOption.getAttribute('data-cost'));
                    const qty = parseFloat(qtyInput.value) || 0;
                    const total = cost * qty;
                    totalCostSpan.innerText = total.toFixed(2);
                  }

                  updateCost();
                </script>
                </body>
                </html>
                `;

                res.send(html);
            });
        });
    });
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

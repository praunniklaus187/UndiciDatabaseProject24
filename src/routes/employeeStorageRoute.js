// src/routes/employeeStorageRoutes.js
const express = require('express');
const db = require('../db');

const router = express.Router();

// Employee Page
router.get('/employee/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Employee Page</title></head>
        <body>
            <h1>Employee Page</h1>
            <p><a href="/employee/storage">View Storage</a></p>
            <p><a href="/employee/logout">Logout</a></p>
        </body>
        </html>
    `);
});

// Employee Storage Overview
router.get('/employee/storage', (req, res) => {
    const selectedBranchId = req.query.branch || null; // Get the branch filter from the query parameter

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
                  <title>Employee Storage Overview</title>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 2em; }
                    table { border-collapse: collapse; width: 100%; margin-bottom: 2em; }
                    th, td { border: 1px solid #ccc; padding: 0.5em; text-align: left; }
                    th { background: #f0f0f0; }
                    h2 { margin-top: 2em; }
                    a { margin-right: 1em; }
                    form { margin-bottom: 1em; }
                  </style>
                </head>
                <body>
                  <h1>Employee - All Branches Storage</h1>
                  <p><a href="/employee/home">Back to Employee Page</a></p>

                  <form method="get" action="/employee/storage">
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

            html += `
                </body>
                </html>
                `;

            res.send(html);
        });
    });
});

module.exports = router;
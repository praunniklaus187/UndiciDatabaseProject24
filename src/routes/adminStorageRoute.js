const express = require('express');
const db = require('../db');

const router = express.Router();

// Admin Dashboard Page
router.get('/employee/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Admin Page</title>
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
            Admin Dashboard
            <button class="home-button" onclick="window.location.href='http://localhost:3000';">Home</button>
          </header>

          <main>
            <h1>Admin Page</h1>
            <p><a href="/admin/storage">View All Storage</a></p>
            <p><a href="/employee/logout">Logout</a></p>
          </main>

          <footer>
            &copy; 2024 Undici. All rights reserved.
          </footer>
        </body>
        </html>
    `);
});

// Admin Storage Page
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

            const branchOptions = branchRes.map(branch => `
                <option value="${branch.BRANCH_ID}" ${branch.BRANCH_ID == selectedBranchId ? 'selected' : ''}>
                    Branch ${branch.BRANCH_ID}
                </option>
            `).join('');

            let html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <title>Admin Storage Overview</title>
                  <style>
                    body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background: #f9f9f9; color: #333; }
                    header { background-color: #ff5733; color: white; padding: 1.5rem 0; font-size: 1.8rem; position: relative; display: flex; align-items: center; justify-content: center; }
                    .home-button { position: absolute; left: 1rem; background-color: white; color: #ff5733; border: none; padding: 0.5rem 1rem; font-size: 1rem; font-weight: bold; border-radius: 4px; cursor: pointer; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); transition: background-color 0.3s ease; }
                    .logout-button { position: absolute; right: 1rem; background-color: white; color: #ff5733; border: none; padding: 0.5rem 1rem; font-size: 1rem; font-weight: bold; border-radius: 4px; cursor: pointer; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); transition: background-color 0.3s ease; }
                    .home-button:hover { background-color: #ffded6; }
                    .logout-button:hover { background-color: #ffded6; }
                    main { max-width: 800px; margin: 2rem auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                    h1 { color: #ff5733; font-size: 2rem; text-align: center; margin-bottom: 1.5rem; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
                    th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
                    th { background-color: #f0f0f0; }
                    footer { text-align: center; padding: 1rem 0; background: #333; color: white; font-size: 0.9rem; margin-top: 2rem; }
                  </style>
                </head>
                <body>
                  <header>
                    Admin Storage
                    <button class="home-button" onclick="window.location.href='http://localhost:3000';">Logout</button>
                    <button class="logout-button" onclick="window.location.href='/employee/admin';">Back to Admin Page</button>
                  </header>
                  <main>
                    <h1>Admin - Storage Overview</h1>
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
                            <th>Actions</th>
                          </tr>
                    `;
                    branches[branchId].forEach(item => {
                        html += `
                            <tr>
                              <td>${item.INGREDIENT_ID}</td>
                              <td>${item.INGREDIENT_NAME}</td>
                              <td>${item.QUANTITY}</td>
                              <td>${item.COST}</td>
                              <td>
                                <form action="/admin/update-storage" method="POST">
                                  <input type="hidden" name="branch_id" value="${item.BRANCH_ID}">
                                  <input type="hidden" name="ingredient_id" value="${item.INGREDIENT_ID}">
                                  <input type="number" name="quantity" value="${item.QUANTITY}" step="0.01">
                                  <button type="submit">Update</button>
                                </form>
                              </td>
                            </tr>
                        `;
                    });
                    html += `</table>`;
                }
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
});

router.post('/admin/update-storage', (req, res) => {
    const { branch_id, ingredient_id, quantity } = req.body;

    if (!branch_id || !ingredient_id || !quantity) {
        return res.status(400).send('All fields are required.');
    }

    const query = `
        UPDATE STORAGE
        SET QUANTITY = ?
        WHERE BRANCH_ID = ? AND INGREDIENT_ID = ?
    `;

    db.query(query, [quantity, branch_id, ingredient_id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating storage.');
        }

        res.redirect('/admin/storage');
    });
});

module.exports = router;


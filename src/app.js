const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Database connection setup
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_database',
});

// Test the database connection
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to the database!');
});

// Generate the next CUSTOMER_ID
const getNextCustomerId = (callback) => {
    const query = 'SELECT MAX(CAST(SUBSTRING(CUSTOMER_ID, 5) AS UNSIGNED)) AS max_id FROM CUSTOMER';
    db.query(query, (err, results) => {
        if (err) {
            return callback(err);
        }
        const maxId = results[0].max_id || 0; // Default to 0 if no customers exist
        const nextId = maxId + 1; // Increment the numeric part
        const customerId = `CUST${String(nextId).padStart(3, '0')}`; // Format as CUST001, CUST002, etc.
        callback(null, customerId);
    });
};

// Route to serve the signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

// Handle signup form submission
app.post('/signup', (req, res) => {
    const { name, street_name, house_number, postal_code, city, country } = req.body;

    if (!name || !street_name || !house_number || !postal_code || !city || !country) {
        return res.status(400).send('All fields are required.');
    }

    db.beginTransaction((err) => {
        if (err) throw err;

        // Step 1: Generate the next CUSTOMER_ID
        getNextCustomerId((err, customer_id) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error generating customer ID.');
            }

            // Step 2: Insert into POSTAL_CODE if it doesn't exist
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

                // Step 3: Insert into ADDRESS
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

                    // Step 4: Insert into CUSTOMER with the generated CUSTOMER_ID
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

                        // Step 5: Commit the transaction
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

// Serve the order page
app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'order.html'));
});

app.post('/order', (req, res) => {
    const { customer_id, branch_id, products } = req.body;

    if (!customer_id || !branch_id || !Array.isArray(products) || products.length === 0) {
        return res.status(400).send('Invalid order data.');
    }

    // Start a transaction to ensure atomicity
    db.beginTransaction((err) => {
        if (err) return res.status(500).send('Database error starting transaction.');

        // Insert new order
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

            // Prepare inserts for ORDER_ITEM
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

                // Fetch product prices for ORDER_ITEM_PRICE
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

                    // Map product_id to price
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

                        // Commit the transaction if everything went fine
                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error(err);
                                    res.status(500).send('Transaction commit failed.');
                                });
                            }
                            res.send(`Order placed successfully with Order ID ${order_id}.`);
                        });
                    });
                });
            });
        });
    });
});

// Get the list of products (pizzas)
app.get('/products', (req, res) => {
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
app.get('/interface', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'interface.html'));
});

// Fetch data from any table dynamically (for admin purposes)
app.get('/table/:tableName', (req, res) => {
    const tableName = req.params.tableName;
    const query = `SELECT * FROM ${mysql.escapeId(tableName)}`;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database query failed');
        } else {
            res.json(results);
        }
    });
});

// Serve the employee login page
app.get('/employee', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'employee.html'));
});

// Handle employee login
app.post('/employee/login', (req, res) => {
    const { employee_id, password } = req.body;

    if (!employee_id || !password) {
        return res.status(400).send('Please provide both Employee ID and password.');
    }

    const query = 'SELECT EMPLOYEE_ID, PASSWORD, ROLE FROM EMPLOYEE WHERE EMPLOYEE_ID = ?';
    db.query(query, [employee_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error.');
        }

        if (results.length === 0) {
            // No employee found
            return res.status(401).send('Invalid Employee ID or Password.');
        }

        const employee = results[0];

        // Check password (In production, use hashing and a secure comparison)
        if (employee.PASSWORD !== password) {
            return res.status(401).send('Invalid Employee ID or Password.');
        }

        // Check role and redirect accordingly
        if (employee.ROLE === 'admin') {
            return res.redirect('/employee/admin');
        } else {
            return res.redirect('/employee/home');
        }
    });
});

// Admin dashboard page (replace with a proper HTML or template)
app.get('/employee/admin', (req, res) => {
    res.send('<h1>Admin Dashboard</h1><p>Welcome Admin!</p>');
});

// Employee dashboard page: Show unfinished orders and allow completing them
app.get('/employee/home', (req, res) => {
    // Fetch all orders that are not completed
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
          <meta charset="UTF-8"/>
          <title>Employee Dashboard</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 2em; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 2em; }
            th, td { border: 1px solid #ccc; padding: 0.5em; text-align: left; }
            th { background: #f0f0f0; }
            form { display: inline-block; }
          </style>
        </head>
        <body>
          <h1>Employee Dashboard</h1>
          <h2>Unfinished Orders</h2>
        `;

        if (orders.length === 0) {
            html += `<p>No unfinished orders at the moment.</p>`;
        } else {
            html += `
            <table>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Branch ID</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
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
                      <input type="hidden" name="order_id" value="${order.ORDER_ID}" />
                      <button type="submit">Complete Order</button>
                    </form>
                  </td>
                </tr>
                `;
            }

            html += `</table>`;
        }

        html += `
        </body>
        </html>
        `;

        res.send(html);
    });
});

// Handle completing an order and updating storage
app.post('/employee/handle-order', (req, res) => {
    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).send('Order ID is required.');
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).send('Error starting transaction.');

        // 1. Update order status to "Completed"
        const updateOrderStatusQuery = `
          UPDATE \`ORDER\`
          SET STATUS = 'Completed'
          WHERE ORDER_ID = ?
        `;
        db.query(updateOrderStatusQuery, [order_id], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error(err);
                    res.status(500).send('Error updating order status.');
                });
            }

            // 2. Get all products for the order
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
                    // No items in this order, just commit
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

                // 3. For each product, find ingredients required
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

                    // Compute total required ingredients
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

                    // 4. Deduct from STORAGE. First get BRANCH_ID for the order
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
                                // All ingredients updated, commit transaction
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




// Root route
app.get('/', (req, res) => {
    res.send(`
        <h1>Welcome to the Pizza Shop!</h1>
        <p><a href="/signup">Sign Up</a> to create an account.</p>
        <p>Already have an account? <a href="/order">Place an Order</a>.</p>
        <p>Are you an employee? <a href="/employee">Sign in here</a>.</p>
    `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

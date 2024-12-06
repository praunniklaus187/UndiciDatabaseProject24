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

            // Prepare inserts for ORDER_ITEM and ORDER_ITEM_PRICE
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

                // If you have a pricing table or logic, insert into ORDER_ITEM_PRICE
                // For this example, let's assume the price is fetched from the PRODUCT table.
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

                    // Map product_id to price for quick lookup
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

    // Escape the table name to prevent SQL injection
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

        // At this point, login is successful. Check role.
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

// Employee dashboard page (replace with a proper HTML or template)
app.get('/employee/home', (req, res) => {
    res.send('<h1>Employee Dashboard</h1><p>Welcome Employee!</p>');
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

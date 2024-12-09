const express = require('express');
const path = require('path'); // Import the path module
const db = require('../db');

const router = express.Router();

router.get('/employee/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin.html')); // Ensure the path is correct
});

// Add employee route (Admin only)
router.post('/api/admin/add-employee', (req, res) => {
    const { name, branch_id, salary, street_name, house_number, postal_code, city, country, password, role } = req.body;

    if (!name || !branch_id || !salary || !street_name || !house_number || !postal_code || !city || !country || !password || !role) {
        return res.status(400).send('All fields are required to add an employee.');
    }

    db.beginTransaction((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Could not start transaction.');
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

                const employeeQuery = `
                    INSERT INTO EMPLOYEE (NAME, BRANCH_ID, SALARY, ADDRESS_ID, PASSWORD, ROLE)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                db.query(employeeQuery, [name, branch_id, salary, address_id, password, role], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error(err);
                            res.status(500).send('Error inserting employee.');
                        });
                    }

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(err);
                                res.status(500).send('Transaction commit failed.');
                            });
                        }
                        res.send('Employee added successfully.');
                    });
                });
            });
        });
    });
});

router.post('/api/admin/add-branch', (req, res) => {
    const { street_name, house_number, postal_code, city, country } = req.body;

    if (!street_name || !house_number || !postal_code || !city || !country) {
        return res.status(400).send('All fields are required to add a branch.');
    }

    db.beginTransaction((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Could not start transaction.');
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

                const branchQuery = `
                    INSERT INTO BRANCH (ADDRESS_ID)
                    VALUES (?)
                `;

                db.query(branchQuery, [address_id], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error(err);
                            res.status(500).send('Error inserting branch.');
                        });
                    }

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(err);
                                res.status(500).send('Transaction commit failed.');
                            });
                        }
                        res.send('Branch added successfully.');
                    });
                });
            });
        });
    });
});

router.post('/api/admin/add-menu-item', (req, res) => {
    const { name, description, price, ingredients } = req.body;

    if (!name || !description || !price || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).send('All fields are required, including at least one ingredient.');
    }

    db.beginTransaction((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Could not start transaction.');
        }

        // Insert the product into the PRODUCT table
        const productQuery = `
      INSERT INTO PRODUCT (NAME, DESCRIPTION, PRICE)
      VALUES (?, ?, ?)
    `;
        db.query(productQuery, [name, description, price], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error(err);
                    res.status(500).send('Error adding menu item.');
                });
            }

            const productId = result.insertId; // Get the newly created product's ID

            // Prepare to insert ingredients into PRODUCT_INGREDIENT
            const ingredientQueries = ingredients.map(ingredient => {
                return new Promise((resolve, reject) => {
                    const ingredientQuery = `
            INSERT INTO PRODUCT_INGREDIENT (PRODUCT_ID, INGREDIENT_ID, QUANTITY_REQUIRED)
            VALUES (?, ?, ?)
          `;
                    db.query(
                        ingredientQuery,
                        [productId, ingredient.ingredient_id, ingredient.quantity_required],
                        (err) => {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });
            });

            // Execute all ingredient insertions
            Promise.all(ingredientQueries)
                .then(() => {
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(err);
                                res.status(500).send('Transaction commit failed.');
                            });
                        }
                        res.send('Menu item and ingredients added successfully.');
                    });
                })
                .catch((error) => {
                    db.rollback(() => {
                        console.error(error);
                        res.status(500).send('Error adding ingredients to menu item.');
                    });
                });
        });
    });
});


// Get all ingredients
router.get('/api/admin/get-ingredients', (req, res) => {
    const query = `SELECT INGREDIENT_ID, NAME FROM INGREDIENT ORDER BY NAME ASC`;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching ingredients.' });
        }
        res.json(results);
    });
});


router.post('/api/admin/give-promotion', (req, res) => {
    const { employee_id, new_salary } = req.body;

    if (!employee_id || !new_salary) {
        return res.status(400).send('Employee ID and new salary are required for promotion.');
    }

    const query = `
        UPDATE EMPLOYEE
        SET SALARY = ?
        WHERE EMPLOYEE_ID = ?
    `;
    db.query(query, [new_salary, employee_id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating employee salary.');
        }
        res.send('Promotion applied successfully.');
    });
});

module.exports = router;

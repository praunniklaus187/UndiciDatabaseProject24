const db = require('../db');

async function insertPostalCode(connection, postal_code, city, country) {
    const postalCodeQuery = `
        INSERT IGNORE INTO POSTAL_CODE (POSTAL_CODE, CITY, COUNTRY)
        VALUES (?, ?, ?)
    `;
    await connection.query(postalCodeQuery, [postal_code, city, country]);
}

async function insertAddress(connection, street_name, house_number, postal_code) {
    const addressQuery = `
        INSERT INTO ADDRESS (STREET_NAME, HOUSE_NUMBER, POSTAL_CODE)
        VALUES (?, ?, ?)
    `;
    const [addressResult] = await connection.query(addressQuery, [street_name, house_number, postal_code]);
    return addressResult.insertId;
}

async function insertBranchRecord(connection, address_id) {
    const branchQuery = `
        INSERT INTO BRANCH (ADDRESS_ID)
        VALUES (?)
    `;
    const [branchResult] = await connection.query(branchQuery, [address_id]);
    return branchResult.insertId;
}

async function insertEmployeeRecord(connection, { name, branch_id, salary, address_id, password, role }) {
    const employeeQuery = `
        INSERT INTO EMPLOYEE (NAME, BRANCH_ID, SALARY, ADDRESS_ID, PASSWORD, ROLE)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.query(employeeQuery, [name, branch_id, salary, address_id, password, role]);
}

async function insertProduct(connection, { name, description, price }) {
    const productQuery = `
        INSERT INTO PRODUCT (NAME, DESCRIPTION, PRICE)
        VALUES (?, ?, ?)
    `;
    const [productResult] = await connection.query(productQuery, [name, description, price]);
    return productResult.insertId;
}

async function insertProductIngredient(connection, product_id, ingredient_id, quantity_required) {
    const ingredientQuery = `
        INSERT INTO PRODUCT_INGREDIENT (PRODUCT_ID, INGREDIENT_ID, QUANTITY_REQUIRED)
        VALUES (?, ?, ?)
    `;
    await connection.query(ingredientQuery, [product_id, ingredient_id, quantity_required]);
}

module.exports = {
    async insertEmployee({ name, branch_id, salary, street_name, house_number, postal_code, city, country, password, role }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            await insertPostalCode(connection, postal_code, city, country);
            const address_id = await insertAddress(connection, street_name, house_number, postal_code);
            await insertEmployeeRecord(connection, { name, branch_id, salary, address_id, password, role });

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw new Error(`Failed to insert employee: ${error.message}`);
        } finally {
            connection.release();
        }
    },

    async insertBranch({ street_name, house_number, postal_code, city, country }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            await insertPostalCode(connection, postal_code, city, country);
            const address_id = await insertAddress(connection, street_name, house_number, postal_code);
            await insertBranchRecord(connection, address_id);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw new Error(`Failed to insert branch: ${error.message}`);
        } finally {
            connection.release();
        }
    },

    async insertMenuItem({ name, description, price, ingredients }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Insert product
            const product_id = await insertProduct(connection, { name, description, price });

            // Insert all product ingredients
            const ingredientQueries = ingredients.map(({ ingredient_id, quantity_required }) =>
                insertProductIngredient(connection, product_id, ingredient_id, quantity_required)
            );
            await Promise.all(ingredientQueries);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw new Error(`Failed to insert menu item: ${error.message}`);
        } finally {
            connection.release();
        }
    },

    async getAllIngredients() {
        try {
            const query = `
                SELECT INGREDIENT_ID, NAME 
                FROM INGREDIENT 
                ORDER BY NAME ASC
            `;
            const [results] = await db.query(query);
            return results;
        } catch (error) {
            throw new Error(`Failed to fetch ingredients: ${error.message}`);
        }
    },

    async updateEmployeeSalary(employee_id, new_salary) {
        try {
            const query = `
                UPDATE EMPLOYEE
                SET SALARY = ?
                WHERE EMPLOYEE_ID = ?
            `;
            await db.query(query, [new_salary, employee_id]);
        } catch (error) {
            throw new Error(`Failed to update employee salary: ${error.message}`);
        }
    }
};

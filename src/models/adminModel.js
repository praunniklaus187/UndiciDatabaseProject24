const db = require('../db');

module.exports = {
    async insertEmployee({ name, branch_id, salary, street_name, house_number, postal_code, city, country, password, role }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const postalCodeQuery = `
                INSERT IGNORE INTO POSTAL_CODE (POSTAL_CODE, CITY, COUNTRY)
                VALUES (?, ?, ?)
            `;
            await connection.query(postalCodeQuery, [postal_code, city, country]);

            const addressQuery = `
                INSERT INTO ADDRESS (STREET_NAME, HOUSE_NUMBER, POSTAL_CODE)
                VALUES (?, ?, ?)
            `;
            const [addressResult] = await connection.query(addressQuery, [street_name, house_number, postal_code]);
            const address_id = addressResult.insertId;

            const employeeQuery = `
                INSERT INTO EMPLOYEE (NAME, BRANCH_ID, SALARY, ADDRESS_ID, PASSWORD, ROLE)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await connection.query(employeeQuery, [name, branch_id, salary, address_id, password, role]);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async insertBranch({ street_name, house_number, postal_code, city, country }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const postalCodeQuery = `
                INSERT IGNORE INTO POSTAL_CODE (POSTAL_CODE, CITY, COUNTRY)
                VALUES (?, ?, ?)
            `;
            await connection.query(postalCodeQuery, [postal_code, city, country]);

            const addressQuery = `
                INSERT INTO ADDRESS (STREET_NAME, HOUSE_NUMBER, POSTAL_CODE)
                VALUES (?, ?, ?)
            `;
            const [addressResult] = await connection.query(addressQuery, [street_name, house_number, postal_code]);
            const address_id = addressResult.insertId;

            const branchQuery = `
                INSERT INTO BRANCH (ADDRESS_ID)
                VALUES (?)
            `;
            await connection.query(branchQuery, [address_id]);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async insertMenuItem({ name, description, price, ingredients }) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const productQuery = `
                INSERT INTO PRODUCT (NAME, DESCRIPTION, PRICE)
                VALUES (?, ?, ?)
            `;
            const [productResult] = await connection.query(productQuery, [name, description, price]);
            const productId = productResult.insertId;

            const ingredientQueries = ingredients.map(({ ingredient_id, quantity_required }) => {
                const ingredientQuery = `
                    INSERT INTO PRODUCT_INGREDIENT (PRODUCT_ID, INGREDIENT_ID, QUANTITY_REQUIRED)
                    VALUES (?, ?, ?)
                `;
                return connection.query(ingredientQuery, [productId, ingredient_id, quantity_required]);
            });

            await Promise.all(ingredientQueries);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async getAllIngredients() {
        const query = `SELECT INGREDIENT_ID, NAME FROM INGREDIENT ORDER BY NAME ASC`;
        const [results] = await db.query(query);
        return results;
    },

    async updateEmployeeSalary(employee_id, new_salary) {
        const query = `
            UPDATE EMPLOYEE
            SET SALARY = ?
            WHERE EMPLOYEE_ID = ?
        `;
        await db.query(query, [new_salary, employee_id]);
    }
};

const db = require('../db');

module.exports = {
    async createPostalCode(postalCode, city, country) {
        const query = `
      INSERT IGNORE INTO POSTAL_CODE (POSTAL_CODE, CITY, COUNTRY)
      VALUES (?, ?, ?)
    `;
        await db.query(query, [postalCode, city, country]);
    },

    async createAddress(streetName, houseNumber, postalCode) {
        const query = `
      INSERT INTO ADDRESS (STREET_NAME, HOUSE_NUMBER, POSTAL_CODE)
      VALUES (?, ?, ?)
    `;
        const [results] = await db.query(query, [streetName, houseNumber, postalCode]);
        return results.insertId;
    },

    async createCustomer(customerId, name, addressId) {
        const query = `
      INSERT INTO CUSTOMER (CUSTOMER_ID, NAME, ADDRESS_ID)
      VALUES (?, ?, ?)
    `;
        await db.query(query, [customerId, name, addressId]);
    },

    async getNextCustomerId() {
        const query = `
            SELECT COALESCE(MAX(CAST(SUBSTRING(CUSTOMER_ID, 5) AS UNSIGNED)), 0) + 1 AS NEXT_ID
            FROM CUSTOMER
            WHERE CUSTOMER_ID LIKE 'CUST%'
        `;
        const [results] = await db.query(query);
        const nextId = results[0].NEXT_ID;
        return `CUST${String(nextId).padStart(3, '0')}`;
    },
};

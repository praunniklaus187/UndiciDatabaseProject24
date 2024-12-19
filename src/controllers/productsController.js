const db = require('../db');

module.exports = {
    // Get the list of products
    async getProducts(req, res) {
        const query = 'SELECT PRODUCT_ID, NAME, DESCRIPTION, PRICE FROM PRODUCT';
        try {
            const [results] = await db.query(query);
            res.json(results);
        } catch (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Database query failed.');
        }
    },

    // Fetch data from any table dynamically
    async getTableData(req, res) {
        const tableName = req.params.tableName;
        const query = `SELECT * FROM ??`;
        try {
            const [results] = await db.query(query, [tableName]);
            res.json(results);
        } catch (err) {
            console.error(`Error fetching data from table ${tableName}:`, err);
            res.status(500).send('Database query failed.');
        }
    }
};

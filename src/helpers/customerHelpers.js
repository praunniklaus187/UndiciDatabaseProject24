// src/helpers/customerHelpers.js
const db = require('../db');

function getNextCustomerId(callback) {
    const query = 'SELECT MAX(CAST(SUBSTRING(CUSTOMER_ID, 5) AS UNSIGNED)) AS max_id FROM CUSTOMER';
    db.query(query, (err, results) => {
        if (err) {
            return callback(err);
        }
        const maxId = results[0].max_id || 0;
        const nextId = maxId + 1;
        const customerId = `CUST${String(nextId).padStart(3, '0')}`;
        callback(null, customerId);
    });
}

module.exports = { getNextCustomerId };

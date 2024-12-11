const db = require('../db');

module.exports = {
    async createOrder(customer_id, branch_id) {
        const query = `
            INSERT INTO \`ORDER\` (STATUS, CUSTOMER_ID, BRANCH_ID, ORDER_DATE)
            VALUES ('In Progress', ?, ?, NOW())
        `;
        const [result] = await db.query(query, [customer_id, branch_id]);
        return result.insertId; // Return the order ID
    },

    async addOrderItems(order_id, products) {
        const orderItems = products.map(({ product_id, quantity }) => [order_id, product_id, quantity]);
        const query = `
            INSERT INTO ORDER_ITEM (ORDER_ID, PRODUCT_ID, QUANTITY)
            VALUES ?
        `;
        await db.query(query, [orderItems]);
    },

    async getProductPrices(productIds) {
        const placeholders = productIds.map(() => '?').join(',');
        const query = `
            SELECT PRODUCT_ID, PRICE FROM PRODUCT WHERE PRODUCT_ID IN (${placeholders})
        `;
        const [results] = await db.query(query, productIds);
        return results;
    },

    async updateStorage(branch_id, ingredientRequirements) {
        for (const [ingredientId, requiredQty] of Object.entries(ingredientRequirements)) {
            const query = `
                UPDATE STORAGE
                SET QUANTITY = QUANTITY - ?
                WHERE BRANCH_ID = ? AND INGREDIENT_ID = ?
            `;
            await db.query(query, [requiredQty, branch_id, ingredientId]);
        }
    }
};

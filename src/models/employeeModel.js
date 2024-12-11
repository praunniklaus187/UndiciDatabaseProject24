const db = require('../db');

module.exports = {
    async getEmployeeById(employee_id) {
        const query = 'SELECT EMPLOYEE_ID, PASSWORD, ROLE FROM EMPLOYEE WHERE EMPLOYEE_ID = ?';
        const [results] = await db.query(query, [employee_id]);
        console.log(results);
        return results[0];
    },

    async getUnfinishedOrders() {
        const query = `
            SELECT O.ORDER_ID, O.STATUS, O.ORDER_DATE, C.NAME AS CUSTOMER_NAME, B.BRANCH_ID
            FROM \`ORDER\` O
            JOIN CUSTOMER C ON O.CUSTOMER_ID = C.CUSTOMER_ID
            JOIN BRANCH B ON O.BRANCH_ID = B.BRANCH_ID
            WHERE O.STATUS != 'Completed'
            ORDER BY O.ORDER_DATE DESC
        `;
        const [results] = await db.query(query);
        return results;
    },

    async completeOrder(order_id) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const updateOrderStatusQuery = `
                UPDATE \`ORDER\`
                SET STATUS = 'Completed'
                WHERE ORDER_ID = ?
            `;
            await connection.query(updateOrderStatusQuery, [order_id]);

            const orderItemsQuery = `
                SELECT PRODUCT_ID, QUANTITY
                FROM ORDER_ITEM
                WHERE ORDER_ID = ?
            `;
            const [orderItems] = await connection.query(orderItemsQuery, [order_id]);

            if (orderItems.length === 0) {
                await connection.commit();
                return;
            }

            const productIds = orderItems.map(i => i.PRODUCT_ID);
            const placeholders = productIds.map(() => '?').join(',');
            const productIngredientsQuery = `
                SELECT PRODUCT_ID, INGREDIENT_ID, QUANTITY_REQUIRED
                FROM PRODUCT_INGREDIENT
                WHERE PRODUCT_ID IN (${placeholders})
            `;
            const [productIngredients] = await connection.query(productIngredientsQuery, productIds);

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

            const branchQuery = `
                SELECT BRANCH_ID FROM \`ORDER\` WHERE ORDER_ID = ?
            `;
            const [branchResult] = await connection.query(branchQuery, [order_id]);
            const branchId = branchResult[0].BRANCH_ID;

            for (const [ingredientId, requiredQty] of Object.entries(ingredientRequirements)) {
                const updateStorageQuery = `
                    UPDATE STORAGE
                    SET QUANTITY = QUANTITY - ?
                    WHERE BRANCH_ID = ? AND INGREDIENT_ID = ?
                `;
                await connection.query(updateStorageQuery, [requiredQty, branchId, ingredientId]);
            }

            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }
};

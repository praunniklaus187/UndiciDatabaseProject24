const db = require('../db');

module.exports = {
    async getEmployeeById(employee_id) {
        try {
            const query = 'SELECT EMPLOYEE_ID, PASSWORD, ROLE FROM EMPLOYEE WHERE EMPLOYEE_ID = ?';
            const [results] = await db.query(query, [employee_id]);
            if (!results.length) {
                throw new Error(`Employee with ID ${employee_id} not found.`);
            }
            console.log(`Employee details for ${employee_id}:`, results[0]);
            return results[0];
        } catch (err) {
            throw new Error(`Error in getEmployeeById: ${err.message}`);
        }
    },

    async getUnfinishedOrders() {
        try {
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
        } catch (err) {
            throw new Error(`Error in getUnfinishedOrders: ${err.message}`);
        }
    },

    async completeOrder(order_id) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Update Order Status
            const updateOrderStatusQuery = `
                UPDATE \`ORDER\`
                SET STATUS = 'Completed'
                WHERE ORDER_ID = ?
            `;
            await connection.query(updateOrderStatusQuery, [order_id]);

            // 2. Get Order Items
            const orderItemsQuery = `
                SELECT PRODUCT_ID, QUANTITY
                FROM ORDER_ITEM
                WHERE ORDER_ID = ?
            `;
            const [orderItems] = await connection.query(orderItemsQuery, [order_id]);

            if (orderItems.length === 0) {
                console.log(`Order ${order_id} has no items. Committing.`);
                await connection.commit();
                return;
            }

            // 3. Get Product Ingredient Requirements
            const productIds = orderItems.map(i => i.PRODUCT_ID);
            const placeholders = productIds.map(() => '?').join(',');
            const productIngredientsQuery = `
                SELECT PRODUCT_ID, INGREDIENT_ID, QUANTITY_REQUIRED
                FROM PRODUCT_INGREDIENT
                WHERE PRODUCT_ID IN (${placeholders})
            `;
            const [productIngredients] = await connection.query(productIngredientsQuery, productIds);

            // 4. Calculate Total Ingredient Requirements
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

            // 5. Update Storage Quantities
            const branchId = await this.getBranchIdForOrder(order_id, connection);

            for (const [ingredientId, requiredQty] of Object.entries(ingredientRequirements)) {
                const updateStorageQuery = `
                    UPDATE STORAGE
                    SET QUANTITY = QUANTITY - ?
                    WHERE BRANCH_ID = ? AND INGREDIENT_ID = ?
                `;
                await connection.query(updateStorageQuery, [requiredQty, branchId, ingredientId]);
            }

            await connection.commit();
            console.log(`Order ${order_id} has been successfully completed.`);
        } catch (err) {
            await connection.rollback();
            console.error(`Error in completeOrder for order ${order_id}:`, err.message);
            throw new Error(`Error in completeOrder: ${err.message}`);
        } finally {
            connection.release();
        }
    },

    async getBranchIdForOrder(order_id, connection) {
        try {
            const query = `
                SELECT BRANCH_ID FROM \`ORDER\` WHERE ORDER_ID = ?
            `;
            const [result] = await connection.query(query, [order_id]);
            if (!result.length) {
                throw new Error(`No branch found for order ${order_id}`);
            }
            return result[0].BRANCH_ID;
        } catch (err) {
            throw new Error(`Error in getBranchIdForOrder: ${err.message}`);
        }
    }
};

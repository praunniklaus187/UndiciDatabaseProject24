const orderModel = require('../models/orderModel');
const db = require('../db');


module.exports = {
    async handleOrderSubmission(req, res) {
        const { customer_id, branch_id, products } = req.body;

        if (!customer_id || !branch_id || !Array.isArray(products) || products.length === 0) {
            return res.status(400).send('Invalid order data.');
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Create the order
            const order_id = await orderModel.createOrder(customer_id, branch_id);

            // 2. Add order items
            await orderModel.addOrderItems(order_id, products);

            // 3. Fetch product prices
            const productIds = products.map(({ product_id }) => product_id);
            const productPrices = await orderModel.getProductPrices(productIds);

            // 4. Calculate ingredient requirements
            const ingredientRequirements = {};
            for (const product of products) {
                const { product_id, quantity } = product;

                const ingredients = await connection.query(`
                    SELECT INGREDIENT_ID, QUANTITY_REQUIRED
                    FROM PRODUCT_INGREDIENT
                    WHERE PRODUCT_ID = ?
                `, [product_id]);

                ingredients[0].forEach(({ INGREDIENT_ID, QUANTITY_REQUIRED }) => {
                    const totalNeeded = QUANTITY_REQUIRED * quantity;
                    if (!ingredientRequirements[INGREDIENT_ID]) {
                        ingredientRequirements[INGREDIENT_ID] = 0;
                    }
                    ingredientRequirements[INGREDIENT_ID] += totalNeeded;
                });
            }

            // 5. Update storage quantities
            await orderModel.updateStorage(branch_id, ingredientRequirements);

            await connection.commit();
            res.redirect('/order/thankyou');
        } catch (err) {
            await connection.rollback();
            console.error('Transaction failed:', err);
            res.status(500).send('Error processing order.');
        } finally {
            connection.release();
        }
    }
};

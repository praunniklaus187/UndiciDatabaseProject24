const db = require('../db');

module.exports = {
    // Fetch all branches
    async getAllBranches() {
        const query = 'SELECT BRANCH_ID FROM BRANCH';
        const [results] = await db.query(query);
        return results;
    },

    // Fetch all storage details
    async getAllStorage() {
        const query = `
            SELECT S.BRANCH_ID, S.INGREDIENT_ID, S.QUANTITY, I.NAME AS INGREDIENT_NAME, I.COST
            FROM STORAGE S
            JOIN INGREDIENT I ON S.INGREDIENT_ID = I.INGREDIENT_ID
            ORDER BY S.BRANCH_ID, I.NAME
        `;
        const [results] = await db.query(query);
        return results;
    },

    // Fetch storage details filtered by branch
    async getStorageDetails(branchId = null) {
        const query = `
        SELECT S.BRANCH_ID, S.INGREDIENT_ID, S.QUANTITY, I.NAME AS INGREDIENT_NAME, I.COST
        FROM STORAGE S
        JOIN INGREDIENT I ON S.INGREDIENT_ID = I.INGREDIENT_ID
        ${branchId ? 'WHERE S.BRANCH_ID = ?' : ''}
        ORDER BY S.BRANCH_ID, I.NAME
    `;
        console.log("Executing query:", query, "with branchId:", branchId); // Debugging log
        const [results] = await db.query(query, branchId ? [branchId] : []);
        return results;
    },

    // Fetch storage data filtered by branch ID (Similar to getStorageDetails)
    async getStorageData(req, res) {
    try {
        const storageData = await storageModel.getStorageDetails();
        if (!storageData || storageData.length === 0) {
            return res.status(200).json({ message: 'No storage data available.', data: [] });
        }
        res.status(200).json({ data: storageData });
    } catch (err) {
        console.error('Error fetching storage details:', err);
        res.status(500).json({ error: 'Error fetching storage data.' });
    }
},

    // Update storage quantity
    async updateStorage(branchId, ingredientId, quantity) {
        const query = `
            UPDATE STORAGE
            SET QUANTITY = ?
            WHERE BRANCH_ID = ? AND INGREDIENT_ID = ?
        `;
        await db.query(query, [quantity, branchId, ingredientId]);
    },

    // Insert or update storage quantity for ordering new ingredients
    async orderIngredients(branchId, ingredientId, quantity) {
        const query = `
            INSERT INTO STORAGE (BRANCH_ID, INGREDIENT_ID, QUANTITY)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE QUANTITY = QUANTITY + VALUES(QUANTITY)
        `;
        await db.query(query, [branchId, ingredientId, quantity]);
    },

    // Fetch all ingredients
    async getAllIngredients() {
        const query = `SELECT INGREDIENT_ID, NAME, COST FROM INGREDIENT ORDER BY NAME`;
        const [results] = await db.query(query);
        return results;
    },
};

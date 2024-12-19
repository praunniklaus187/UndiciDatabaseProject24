const storageModel = require('../models/storageModel');
const path = require('path');

module.exports = {
    async getStorageData(req, res) {
    try {
        const branchId = req.query.branch || null;
        const storageData = branchId
            ? await storageModel.getStorageDetails(branchId)
            : await storageModel.getAllStorage();

        if (!storageData || storageData.length === 0) {
            return res.status(200).json({ message: 'No storage data available.', data: [] });
        }

        res.status(200).json({ data: storageData });
    } catch (err) {
        console.error('Error fetching storage data:', err);
        res.status(500).json({ error: 'Error fetching storage data.' });
    }
},
    async getBranches(req, res) {
        try {
            const branches = await storageModel.getAllBranches();
            if (!branches || branches.length === 0) {
                return res.status(200).json({ message: 'No branches available.', data: [] });
            }
            res.status(200).json({ data: branches });
        } catch (err) {
            console.error('Error fetching branches:', err);
            res.status(500).json({ error: 'Error fetching branches.' });
        }
    },

    // Fetch storage data filtered by branch
    async getFilteredStorage(req, res) {
        try {
            const branchId = req.query.branch || null;
            const storageData = branchId
                ? await storageModel.getStorageDetails(branchId)
                : await storageModel.getAllStorage();

            if (!storageData || storageData.length === 0) {
                return res.status(200).json({ message: 'No storage data available.', data: [] });
            }

            res.status(200).json({ data: storageData });
        } catch (err) {
            console.error('Error fetching filtered storage data:', err);
            res.status(500).json({ error: 'Error fetching storage data.' });
        }
    },


    async updateStorage(req, res) {
        const { adjustment, branch_id, ingredient_id } = req.body;

        if (!branch_id || !ingredient_id || adjustment === undefined) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const adjustmentValue = parseFloat(adjustment);
        if (isNaN(adjustmentValue)) {
            return res.status(400).json({ error: 'Invalid adjustment value.' });
        }

        try {
            const currentData = await storageModel.getStorageDetails(branch_id);
            const currentQuantity = currentData.find(item => item.INGREDIENT_ID === parseInt(ingredient_id))?.QUANTITY;

            if (currentQuantity === undefined) {
                return res.status(404).json({ error: 'Ingredient not found in storage.' });
            }

            console.log(adjustmentValue);
            console.log(currentQuantity)
            // Calculate the new quantity
            const newQuantity = Number(currentQuantity) + Number(adjustmentValue);


            if (newQuantity < 0) {
                return res.status(400).json({ error: 'Quantity cannot be negative.' });
            }

            // Update the storage quantity
            await storageModel.updateStorage(newQuantity,branch_id, ingredient_id);

            res.status(200).json({ message: 'Storage updated successfully!' });
        } catch (err) {
            await storageModel.getStorageDetails(branchId);
        }
    },


    async viewStorage(req, res) {
        try {
            const storageData = await storageModel.getAllStorage();
            const branches = await storageModel.getAllBranches();
            const ingredients = await storageModel.getAllIngredients();

            res.sendFile(path.join(__dirname, '../views/storage.html'));
        } catch (error) {
            console.error('Error fetching storage data:', error);
            res.status(500).send('Error fetching storage data.');
        }
    },

    async orderIngredients(req, res) {
        const { branch_id, ingredient_id, quantity } = req.body;

        if (!branch_id || !ingredient_id || !quantity) {
            return res.status(400).send('All fields are required (branch, ingredient, quantity).');
        }

        const qty = parseFloat(quantity);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).send('Quantity must be a positive number.');
        }

        try {
            await storageModel.orderIngredients(branch_id, ingredient_id, qty);
            res.redirect('/admin/storage');
        } catch (error) {
            console.error('Error ordering ingredients:', error);
            res.status(500).send('Error ordering ingredients.');
        }
    },
    async getStorage(req, res) {
        try {
            const branchId = req.query.branch || null;
            const storageData = await storageModel.getStorageDetails(branchId);
            res.status(200).json({ data: storageData });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error fetching storage data.' });
        }
    },
};

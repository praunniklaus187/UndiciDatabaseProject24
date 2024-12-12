const storageModel = require('../models/storageModel');
const path = require('path'); // Import the path module

module.exports = {
    // Fetch all storage data and return as JSON
    async getStorageData(req, res) {
    try {
        const branchId = req.query.branch || null; // Get branch ID from query params
        const storageData = branchId
            ? await storageModel.getStorageDetails(branchId) // Filtered data
            : await storageModel.getAllStorage(); // All data

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
            const branchId = req.query.branch || null; // Retrieve branch query param
            const storageData = branchId
                ? await storageModel.getStorageData(branchId) // Filtered data
                : await storageModel.getAllStorage(); // All data

            res.status(200).json({ data: storageData }); // Return JSON response
        } catch (err) {
            console.error('Error fetching filtered storage data:', err);
            res.status(500).json({ error: 'Error fetching storage data.' });
        }
    },

    // Update storage data
    async updateStorage(req, res) {
        const { branch_id, ingredient_id, quantity } = req.body;

        if (!branch_id || !ingredient_id || !quantity) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        try {
            await storageModel.updateStorage(branch_id, ingredient_id, quantity);
            res.status(200).json({ message: 'Storage updated successfully!' });
        } catch (err) {
            console.error('Error updating storage:', err);
            res.status(500).json({ error: 'Error updating storage.' });
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

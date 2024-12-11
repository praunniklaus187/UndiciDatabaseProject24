const adminModel = require('../models/adminModel');

module.exports = {
    async addEmployee(req, res) {
        const { name, branch_id, salary, street_name, house_number, postal_code, city, country, password, role } = req.body;

        if (!name || !branch_id || !salary || !street_name || !house_number || !postal_code || !city || !country || !password || !role) {
            return res.status(400).send('All fields are required to add an employee.');
        }

        try {
            await adminModel.insertEmployee({ name, branch_id, salary, street_name, house_number, postal_code, city, country, password, role });
            res.send('Employee added successfully.');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding employee.');
        }
    },

    async addBranch(req, res) {
        const { street_name, house_number, postal_code, city, country } = req.body;

        if (!street_name || !house_number || !postal_code || !city || !country) {
            return res.status(400).send('All fields are required to add a branch.');
        }

        try {
            await adminModel.insertBranch({ street_name, house_number, postal_code, city, country });
            res.send('Branch added successfully.');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding branch.');
        }
    },

    async addMenuItem(req, res) {
        const { name, description, price, ingredients } = req.body;

        if (!name || !description || !price || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).send('All fields are required, including at least one ingredient.');
        }

        try {
            await adminModel.insertMenuItem({ name, description, price, ingredients });
            res.send('Menu item and ingredients added successfully.');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error adding menu item.');
        }
    },

    async getIngredients(req, res) {
        try {
            const ingredients = await adminModel.getAllIngredients();
            res.json(ingredients);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error fetching ingredients.' });
        }
    },

    async givePromotion(req, res) {
        const { employee_id, new_salary } = req.body;

        if (!employee_id || !new_salary) {
            return res.status(400).send('Employee ID and new salary are required for promotion.');
        }

        try {
            await adminModel.updateEmployeeSalary(employee_id, new_salary);
            res.send('Promotion applied successfully.');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error updating employee salary.');
        }
    }
};

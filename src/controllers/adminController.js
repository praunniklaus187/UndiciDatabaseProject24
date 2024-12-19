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
        } catch (error) {
            console.error('Error adding employee:', error);
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
        } catch (error) {
            console.error('Error adding branch:', error);
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
        } catch (error) {
            console.error('Error adding menu item:', error);
            res.status(500).send('Error adding menu item.');
        }
    },

    async getIngredients(req, res) {
        try {
            const ingredients = await adminModel.getAllIngredients();
            res.json({ data: ingredients });
        } catch (error) {
            console.error('Error fetching ingredients:', error);
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
            res.json({ message: 'Promotion applied successfully.' });
        } catch (error) {
            console.error('Error applying promotion:', error);
            res.status(500).send('Error applying promotion.');
        }
    }
};

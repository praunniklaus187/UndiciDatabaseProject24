const customerModel = require('../models/customerModel');

module.exports = {
    async signup(req, res) {
        const { name, street_name, house_number, postal_code, city, country } = req.body;

        if (!name || !street_name || !house_number || !postal_code || !city || !country) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        try {
            const customerId = await customerModel.getNextCustomerId();

            await customerModel.createPostalCode(postal_code, city, country);
            const addressId = await customerModel.createAddress(street_name, house_number, postal_code);
            await customerModel.createCustomer(customerId, name, addressId);

            res.status(201).json({ message: 'Signup successful!', customer_id: customerId });
        } catch (error) {
            console.error('Error during signup:', error);
            res.status(500).json({ error: 'An error occurred during signup. Please try again.' });
        }
    },
};

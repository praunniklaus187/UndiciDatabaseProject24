const employeeModel = require('../models/employeeModel');

module.exports = {
    async handleLogin(req, res) {
        console.log('Received request at /employee/login');
        console.log('Request body:', req.body);
        const { employee_id, password } = req.body;


        if (!employee_id || !password) {
            return res.status(400).send('Please provide both Employee ID and password.');
        }

        try {
            const employee = await employeeModel.getEmployeeById(employee_id);

            if (!employee || employee.PASSWORD !== password) {
                return res.status(401).send('Invalid Employee ID or Password.');
            }

            if (employee.ROLE === 'admin') {
                return res.redirect('/employee/admin');
            } else {
                return res.redirect('/employee/home');
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Error processing login.');
        }
    },

    async showDashboard(req, res) {
        try {
            const orders = await employeeModel.getUnfinishedOrders();
            res.render('employeeDashboard', { orders });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error fetching dashboard data.');
        }
    },

    async handleOrder(req, res) {
        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).send('Order ID is required.');
        }

        try {
            await employeeModel.completeOrder(order_id);
            res.redirect('/employee/home');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error handling the order.');
        }
    }
};

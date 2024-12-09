// src/app.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./db');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productsRoutes = require('./routes/productsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeLoginRoutes = require('./routes/employeeLoginRoutes');
const employeeDashboardRoutes = require('./routes/employeeDashboardRoutes');
const adminStorageRoute = require('./routes/adminStorageRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use(customerRoutes);
app.use(orderRoutes);
app.use(productsRoutes);
app.use(adminRoutes);
app.use(employeeLoginRoutes);
app.use(employeeDashboardRoutes);
app.use(adminStorageRoute);

// Root route
app.get('/', (req, res) => {
    res.send(`
        <h1>Welcome to the Pizza Shop!</h1>
        <p><a href="/signup">Sign Up</a> to create an account.</p>
        <p>Already have an account? <a href="/order">Place an Order</a>.</p>
        <p>Are you an employee? <a href="/employee">Sign in here</a>.</p>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

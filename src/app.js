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
const employeeDashboardRoutes = require('./routes/employeeDashboardRoutes');
const adminStorageRoute = require('./routes/adminStorageRoute');
const employeeStorageRoute = require('./routes/employeeStorageRoute');
const employeeRoutes = require('./routes/employeeRoutes');



const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
// Routes
app.use(customerRoutes);
app.use(orderRoutes);
app.use(productsRoutes);
app.use(adminRoutes);
app.use(employeeDashboardRoutes);
app.use(adminStorageRoute);
app.use(employeeStorageRoute);
app.use(employeeRoutes);

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'root.html'));
});

app.get('/employee', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'employee.html'));
});

app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'order.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});
app.get('employee/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('employee/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'employeeDashboard.html'));
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// src/routes/employeeStorageRoutes.js
const express = require('express');
const db = require('../db');

const router = express.Router();

// Employee Page
router.get('/employee/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Employee Page</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background: #f9f9f9;
              color: #333;
            }

            header {
              background-color: #ff5733;
              color: white;
              text-align: center;
              padding: 1.5rem 0;
              font-size: 1.8rem;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .home-button {
              position: absolute;
              left: 1rem;
              background-color: white;
              color: #ff5733;
              border: none;
              padding: 0.5rem 1rem;
              font-size: 1rem;
              font-weight: bold;
              border-radius: 4px;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              transition: background-color 0.3s ease;
            }

            .home-button:hover {
              background-color: #ffded6;
            }

            main {
              max-width: 800px;
              margin: 2rem auto;
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            h1 {
              color: #ff5733;
              font-size: 2rem;
              text-align: center;
              margin-bottom: 1.5rem;
            }

            footer {
              text-align: center;
              padding: 1rem 0;
              background: #333;
              color: white;
              font-size: 0.9rem;
              margin-top: 2rem;
            }
            
          </style>
        </head>
        <body>
          <header>
            Undici -Employee Dashboard
            <button class="home-button" onclick="window.location.href='http://localhost:3000';">Logout</button>
          </header>

          <main>
            <h1>Employee Page</h1>
            <p><a href="/employee/storage">View Storage</a></p>
            <p><a href="/employee/logout">Logout</a></p>
          </main>



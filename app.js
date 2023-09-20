// Imported required modules
const express = require('express');
const mysql = require('mysql2/promise'); 
const app = express();
const port = 3000; 

// Database connection configuration as per given db credentials
const dbConfig = {
  host: 'sql348.main-hosting.eu',
  user: 'u841345258_MVCu',
  password: 'Instient@2023',
  database: 'u841345258_MVC',
  port: 3306,
};

// Middleware to parse JSON requests
app.use(express.json());

// Created a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// API endpoint to retrieve the list of customers from db
app.get('/api/customers', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM customers');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to retrieve orders for a specific customer based on customer Id
app.get('/api/orders/:customerId', async (req, res) => {
  const customerId = req.params.customerId;
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM orders WHERE customer_id = ?', [customerId]);
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to retrieve total number of orders and total amount for each customer, sorted alphabetically by customer country
app.get('/api/summary', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(`
        SELECT customers.country, customers.name AS customer_name,
               COUNT(orders.customer_id) AS total_orders, SUM(orders.amount) AS total_amount
        FROM customers
        LEFT JOIN orders ON customers.id = orders.customer_id
        GROUP BY customers.country, customers.name
        ORDER BY customers.country
      `);
      connection.release();
      res.json(rows);
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
// Start the server with given port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

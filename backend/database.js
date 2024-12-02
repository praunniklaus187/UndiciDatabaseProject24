import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'undiciDB'
}).promise()

// Assuming CUSTOMER is a predefined object or database of customers
export async function loginCustomer(id) {
  if (CUSTOMER[id]) { // Check if the customer exists in the CUSTOMER database
    // Simulating a database query
    const customer = CUSTOMER[id]; // Fetch customer information
    return "This is a Customer";
  } else {
    throw new Error("Customer not found"); // Handle cases where the customer does not exist
  }
}

// Example function to demonstrate the use case
async function exampleUseCase() {
  const customerId = "CUST001"; // Customer ID to log in

  try {
    const result = await loginCustomer(customerId); // Call the login function
    console.log(result); // Output the success message
  } catch (error) {
    console.error("An error occurred:", error.message); // Handle login errors
  }
}

// Run the example
exampleUseCase();


async function createCustomer(customerId, name, addressId) {
  const query = `
    INSERT INTO CUSTOMER (CUSTOMER_ID, NAME, ADDRESS_ID)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  
  try {
    // Execute the query
    const result = await pool.query(query, [customerId, name, addressId]);
    return result.rows[0]; // Return the inserted row
  } catch (error) {
    console.error('Error inserting customer:', error);
    throw error; // Propagate the error for proper handling
  }
}
 





// Import the necessary dependencies
require('dotenv').config();  // Loads environment variables from a .env file into process.env
const express = require('express');  // Express is a minimal web application framework for Node.js
const cors = require('cors');  // CORS is a middleware that allows or restricts requests from different origins

// Initialize the express app
const app = express();

// Set up a port for the server to listen on (either from environment variables or default to 5000)
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());  // Enable CORS for all requests (important when your frontend and backend are on different domains)
app.use(express.json());  // Automatically parse incoming JSON requests

// Import and use authentication routes
app.use('/uds-api', require('./routes/authRoutes')); // Route for authentication related requests

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);  // Log a message to the console when the server starts
});

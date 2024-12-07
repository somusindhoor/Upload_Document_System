// Import required dependencies
const express = require('express');  // Express web framework for handling routes
const router = express.Router();  // Router to handle the HTTP requests
const bcrypt = require('bcrypt');  // bcrypt library for hashing passwords
const jwt = require('jsonwebtoken');  // jwt library for creating and verifying JSON Web Tokens
const fs = require('fs');  // File system module to read and write to files
require('dotenv').config();  // Loads environment variables from a .env file into process.env
// Path to the users.json file
const path = require('path');
const usersFilePath = path.join(__dirname, '../users/users.json');

// Function to read the users from the file
const readUsersFromFile = () => {
  if (!fs.existsSync(usersFilePath)) {
    return [];  // If the file does not exist, return an empty array
  }
  const data = fs.readFileSync(usersFilePath, 'utf8');  // Read file data
  return JSON.parse(data);  // Parse JSON data into an object
};

// Function to write users to the file
const writeUsersToFile = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');  // Write users data to file
};

// POST request for user signup (creating a new user)
router.post('/signup', async (req, res) => {
  console.log("Signup Request Data:", req.body);
  
  // Destructure the request body to get user details
  const { firstName, lastName, email, password } = req.body;

  // Check if all required fields are provided
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Read users from the file
  const users = readUsersFromFile();

  // Check if the email already exists in the "database"
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user object
  const newUser = { firstName, lastName, email, password: hashedPassword };

  // Add the new user to the "database" (users array)
  users.push(newUser);

  // Write the updated users list to the file
  writeUsersToFile(users);

  // Send a success response with a message
  res.status(201).json({ message: 'User created successfully' });
});

// POST request for user login (checking credentials)
router.post('/login', async (req, res) => {
  console.log("Login data: ", req.body);
  
  // Destructure the request body to get login credentials
  const { email, password } = req.body;

  // Check if both email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Read users from the file
  const users = readUsersFromFile();

  // Find the user in the "database" based on the provided email
  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate a JWT token upon successful login
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,  // Set token expiration from environment variable (e.g., '1h')
  });

  // Send a success response with the JWT token
  res.status(200).json({ message: 'Login successful', token });
});

// Export the router to be used in the main app
module.exports = router;

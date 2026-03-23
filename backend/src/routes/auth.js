const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock user database
let users = [];

// User registration endpoint
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user
    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully.' });
});

// User login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);

    // Check if user exists
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' }); // Replace 'your_jwt_secret' with environment variable in real apps
    res.json({ token });
});

module.exports = router;
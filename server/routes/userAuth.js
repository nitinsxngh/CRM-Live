const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users'); // Adjust the path to your User model
const router = express.Router();

// User login route
router.post('/api/user/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // Generic error message for both email and password issues
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Generic error message for both email and password issues
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create a JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET, // Ensure you have JWT_SECRET in your .env file
            { expiresIn: '1h' }
        );

        // Send the token in the response
        res.json({ token });
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

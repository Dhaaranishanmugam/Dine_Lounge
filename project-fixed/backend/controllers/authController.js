const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');

// Hardcoded users for demo (in production, use database)
const users = [
    {
        id: 1,
        username: 'admin',
        password: '$2b$10$YourHashedPasswordHere', // Will compare plain text for demo
        role: 'admin',
        name: 'Administrator'
    },
    {
        id: 2,
        username: 'chef',
        password: '$2b$10$YourHashedPasswordHere',
        role: 'chef',
        name: 'Head Chef'
    }
];

// Simple plain text comparison for demo (replace with bcrypt in production)
const VALID_CREDENTIALS = {
    admin: { username: 'admin', password: 'admin123', role: 'admin' },
    chef: { username: 'chef', password: 'chef123', role: 'chef' }
};

// Login Controller
exports.login = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Validate input
        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                error: 'Please provide username, password, and role'
            });
        }

        // Check role validity
        if (!['admin', 'chef'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role'
            });
        }

        // Validate credentials (demo mode - plain text)
        const validUser = VALID_CREDENTIALS[role];
        
        if (username !== validUser.username || password !== validUser.password) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken({
            id: role === 'admin' ? 1 : 2,
            username: validUser.username,
            role: validUser.role
        });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: role === 'admin' ? 1 : 2,
                username: validUser.username,
                role: validUser.role,
                name: role === 'admin' ? 'Administrator' : 'Head Chef'
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

// Get Current User
exports.getMe = async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Logout (client-side token removal)
exports.logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};
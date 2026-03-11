const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dine-lounge-secret-key-change-in-production';

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Verify JWT Middleware
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// Role-based access control
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: 'Access denied. Insufficient permissions.' });
        }
        
        next();
    };
};

module.exports = {
    generateToken,
    authMiddleware,
    requireRole,
    JWT_SECRET
};
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key-12345';

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Find user and attach to request
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Authentication failed. User no longer exists.' });
    }

    // Attach user information to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;

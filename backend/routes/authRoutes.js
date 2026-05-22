const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key-12345';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Simple manual validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter all fields (Name, Email, Password).' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Exclude password from output
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    };

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Signup error:', error);
    // Sequelize unique validation mapping
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email is already registered.' });
    }
    return res.status(500).json({ error: 'Server error during signup.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    // Find user with password scope
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials. User not found.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials. Password incorrect.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user details (Protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is already populated by authMiddleware (without password)
    return res.json({ user: req.user });
  } catch (error) {
    console.error('Fetch user error:', error);
    return res.status(500).json({ error: 'Server error fetching user profile.' });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users (convenient for user search when adding project members)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email']
    });
    return res.json({ users });
  } catch (error) {
    console.error('Fetch all users error:', error);
    return res.status(500).json({ error: 'Server error fetching users.' });
  }
});

module.exports = router;

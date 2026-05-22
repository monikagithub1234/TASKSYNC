const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./db');
const seedData = require('./seed');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // In production, we build client & server into one so CORS is technically fully secure and unneeded, but useful for dev.
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Production Static Serving
// Express serves frontend dist assets when deployed in production (e.g. Railway)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// For SPA routing, redirect all unmatched requests to index.html
app.get('*', (req, res) => {
  // Only serve index.html if file exists, avoiding intercepting non-existent API requests
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      // In dev, frontend is served by Vite on a different port, so index.html might not exist in dist yet
      res.status(200).send('API Server is running. Frontend has not been built yet.');
    }
  });
});

// Start Server
const startServer = async () => {
  try {
    // 1. Establish Database Connection & Sync tables
    await connectDB();

    // 2. Run Seeder to add mock users and tasks
    await seedData();

    // 3. Bind port
    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚀 API Server is running on port ${PORT}`);
      console.log(`💻 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

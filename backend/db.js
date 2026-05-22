const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

let sequelize;

// If DATABASE_URL is present, we are in production (e.g., Railway with PostgreSQL)
if (process.env.DATABASE_URL) {
  console.log('Connecting to PostgreSQL database (Production mode)...');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Railway's default SSL connection
      }
    },
    logging: false // Toggle this to true if you want SQL query logs in console
  });
} else {
  // Local development falls back to SQLite
  console.log('Connecting to SQLite database (Development mode)...');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
  });
}

// Function to test the connection and sync schemas
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successfully established.');
    
    // Sync models to the database (creates tables if they don't exist)
    // In dev, alter: true updates tables safely when schema changes
    await sequelize.sync({ alter: true });
    console.log('Database tables synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB
};

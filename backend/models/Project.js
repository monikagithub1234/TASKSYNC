const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Project name is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Project;

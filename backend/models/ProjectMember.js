const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const ProjectMember = sequelize.define('ProjectMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Member',
    validate: {
      isIn: {
        args: [['Admin', 'Member']],
        msg: 'Role must be either Admin or Member'
      }
    }
  }
});

module.exports = ProjectMember;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Task title is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'To Do',
    validate: {
      isIn: {
        args: [['To Do', 'In Progress', 'Done']],
        msg: 'Status must be To Do, In Progress, or Done'
      }
    }
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Medium',
    validate: {
      isIn: {
        args: [['Low', 'Medium', 'High']],
        msg: 'Priority must be Low, Medium, or High'
      }
    }
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Due date is required' }
    }
  }
});

module.exports = Task;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  minThreshold: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  category: {
    type: DataTypes.ENUM('ingredients', 'beverages', 'supplies', 'equipment'),
    allowNull: false
  }
});

module.exports = Inventory; 
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 20
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  specialRequests: {
    type: DataTypes.TEXT
  },
  contactInfo: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  tableId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tables',
      key: 'id'
    }
  },
  OrderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id'
    }
  }
}, {
  tableName: 'reservations',
  timestamps: true
});

module.exports = Reservation; 
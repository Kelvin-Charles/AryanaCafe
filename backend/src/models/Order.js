const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'preparing', 'ready', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  orderType: {
    type: DataTypes.ENUM('dine-in', 'takeaway', 'delivery'),
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    defaultValue: 'pending'
  },
  tableNumber: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1
    }
  },
  deliveryAddress: {
    type: DataTypes.JSON
  },
  specialRequests: {
    type: DataTypes.TEXT
  },
  guestInfo: {
    type: DataTypes.JSON
  },
  estimatedDeliveryTime: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'orders',
  timestamps: true
});

module.exports = Order; 
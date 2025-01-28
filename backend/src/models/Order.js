const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
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
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerPhone: {
    type: DataTypes.STRING
  },
  guestInfo: {
    type: DataTypes.JSON
  },
  estimatedDeliveryTime: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'orders',
  timestamps: true,
  hooks: {
    beforeCreate: async (order) => {
      if (order.userId) {
        const { User } = require('../models');
        const user = await User.findByPk(order.userId);
        if (user) {
          order.customerName = user.name;
          order.customerEmail = user.email;
        }
      }
    }
  }
});

module.exports = Order; 
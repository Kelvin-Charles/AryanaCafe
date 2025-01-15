const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  guest_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  guest_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  guest_email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'preparing', 'ready', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  order_type: {
    type: DataTypes.ENUM('dine-in', 'takeaway', 'delivery'),
    allowNull: false
  },
  table_number: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    defaultValue: 'pending'
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'card', 'online'),
    defaultValue: 'cash'
  },
  special_requests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estimated_delivery_time: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  validate: {
    userOrGuest() {
      if (!this.user_id && !this.guest_phone) {
        throw new Error('Either user_id or guest_phone must be provided');
      }
    }
  }
});

module.exports = Order; 
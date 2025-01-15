const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import models
const User = require('./User');
const MenuItem = require('./MenuItem');
const DietaryOption = require('./DietaryOption');
const Reservation = require('./Reservation');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Initialize models
const models = {
  User,
  MenuItem,
  DietaryOption,
  Reservation,
  Order,
  OrderItem
};

// MenuItem - DietaryOption associations
MenuItem.belongsToMany(DietaryOption, {
  through: 'menu_item_dietary_options',
  foreignKey: 'menu_item_id',
  otherKey: 'dietary_option_id'
});

DietaryOption.belongsToMany(MenuItem, {
  through: 'menu_item_dietary_options',
  foreignKey: 'dietary_option_id',
  otherKey: 'menu_item_id'
});

// User - Reservation associations
User.hasMany(Reservation, {
  foreignKey: 'user_id'
});
Reservation.belongsTo(User, {
  foreignKey: 'user_id'
});

// User - Order associations
User.hasMany(Order, {
  foreignKey: 'user_id'
});
Order.belongsTo(User, {
  foreignKey: 'user_id'
});

// Order - OrderItem - MenuItem associations
Order.hasMany(OrderItem, {
  foreignKey: 'order_id'
});
OrderItem.belongsTo(Order, {
  foreignKey: 'order_id'
});

MenuItem.hasMany(OrderItem, {
  foreignKey: 'menu_item_id'
});
OrderItem.belongsTo(MenuItem, {
  foreignKey: 'menu_item_id'
});

// Add Sequelize instance to models
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
}; 
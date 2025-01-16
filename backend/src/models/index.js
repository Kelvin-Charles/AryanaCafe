const User = require('./User');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Reservation = require('./Reservation');

// User associations
User.hasMany(Order, { foreignKey: 'userId' });
User.hasMany(Reservation, { foreignKey: 'userId' });

// Order associations
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menuItemId' });

// MenuItem associations
MenuItem.hasMany(OrderItem, { foreignKey: 'menuItemId' });

// Reservation associations
Reservation.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  MenuItem,
  Order,
  OrderItem,
  Reservation
}; 
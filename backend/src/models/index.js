const User = require('./User');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Reservation = require('./Reservation');
const Shift = require('./Shift');
const Inventory = require('./Inventory');
const Table = require('./Table');

// User associations
User.hasMany(Order);
User.hasMany(Reservation);
User.hasMany(Shift);
User.hasMany(Table, { foreignKey: 'waiterId', as: 'assignedTables' });

// Order associations
Order.belongsTo(User);
Order.hasMany(OrderItem, { as: 'items', onDelete: 'CASCADE' });
Order.belongsTo(Table, { as: 'table' });
Order.hasOne(Reservation);

// OrderItem associations
OrderItem.belongsTo(Order);
OrderItem.belongsTo(MenuItem);

// MenuItem associations
MenuItem.hasMany(OrderItem);

// Reservation associations
Reservation.belongsTo(User);
Reservation.belongsTo(Table, { foreignKey: 'tableId' });
Reservation.belongsTo(Order, { foreignKey: 'OrderId' });

// Shift associations
Shift.belongsTo(User, { foreignKey: 'staffId' });

// Table associations
Table.belongsTo(User, { foreignKey: 'waiterId', as: 'waiter' });
Table.belongsTo(Order, { foreignKey: 'currentOrderId', as: 'currentOrder' });

module.exports = {
  User,
  MenuItem,
  Order,
  OrderItem,
  Reservation,
  Shift,
  Inventory,
  Table
}; 
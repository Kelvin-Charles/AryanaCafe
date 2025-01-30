const express = require('express');
const router = express.Router();

// Import all route modules
const tablesRoutes = require('./tables');
const reservationsRoutes = require('./reservations');
const addressesRoutes = require('./addresses');
const ordersRoutes = require('./orders');
const usersRoutes = require('./users');
const authRoutes = require('./auth');
const inventoryRoutes = require('./inventory');
const shiftsRoutes = require('./shifts');
const cartRoutes = require('./cart');
const menuRoutes = require('./menu');

// Use the routes
router.use('/tables', tablesRoutes);
router.use('/reservations', reservationsRoutes);
router.use('/addresses', addressesRoutes);
router.use('/orders', ordersRoutes);
router.use('/users', usersRoutes);
router.use('/auth', authRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/shifts', shiftsRoutes);
router.use('/cart', cartRoutes);
router.use('/menu', menuRoutes);

module.exports = router; 
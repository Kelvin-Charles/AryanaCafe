const express = require('express');
const router = express.Router();
const { Order, OrderItem, MenuItem } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const orders = await Order.findAll({
      include: [{
        model: OrderItem,
        as: 'items',
        include: [MenuItem]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    console.log('Fetching orders for user:', {
      userId: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });

    // First, check if any orders exist for this user
    const orderCount = await Order.count({
      where: { userId: req.user.id }
    });
    console.log('Total orders found in database:', orderCount);

    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [MenuItem]
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log('Found orders:', {
      count: orders.length,
      orderIds: orders.map(o => o.orderId)
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, orderType, tableNumber, deliveryAddress, specialRequests } = req.body;

    // Validate items
    if (!items || !items.length) {
      return res.status(400).json({ error: 'No items in order' });
    }

    // Get user information and validate
    console.log('Initial user from request:', {
      userId: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });

    const user = await req.user.reload();
    console.log('User after reload:', {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
      }
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions
      });
    }

    // Round total amount to 2 decimal places
    totalAmount = Math.round(totalAmount * 100) / 100;

    // Generate unique orderId
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = require('crypto').randomBytes(2).toString('hex').toUpperCase();
    const orderId = `${timestamp.slice(-3)}${random.slice(0, 3)}`;

    // Create order with explicit userId
    const orderData = {
      orderId,
      userId: user.id,  // Ensure this is explicitly set
      customerName: user.name,
      customerEmail: user.email,
      status: 'pending',
      orderType,
      totalAmount,
      paymentStatus: 'pending',
      tableNumber: orderType === 'dine-in' ? tableNumber : null,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      specialRequests
    };

    console.log('Creating order with data:', {
      ...orderData,
      items: orderItems.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price
      }))
    });

    const order = await Order.create(orderData);
    console.log('Order created successfully:', {
      orderId: order.orderId,
      id: order.id,
      userId: order.userId,
      customerName: order.customerName,
      customerEmail: order.customerEmail
    });

    // Create order items
    const createdItems = await OrderItem.bulkCreate(
      orderItems.map(item => ({ ...item, orderId: order.id }))
    );
    console.log('Created order items:', createdItems.length);

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [MenuItem]
      }]
    });

    // Format the response
    const formattedOrder = {
      ...completeOrder.toJSON(),
      totalAmount: Number(completeOrder.totalAmount).toLocaleString()
    };

    res.status(201).json(formattedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message
    });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only admin can update any order status
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Customers can only cancel their pending orders
    if (req.user.role === 'customer' && (
      order.status !== 'pending' || 
      status !== 'cancelled'
    )) {
      return res.status(403).json({ error: 'Cannot update order status' });
    }

    await order.update({ status });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order by id
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [MenuItem]
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only admin or order owner can view order details
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
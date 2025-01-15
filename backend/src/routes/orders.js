const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { auth, adminAuth } = require('../middleware/auth');

// Get all orders (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, orderType } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (orderType) {
      query.orderType = orderType;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.menuItem')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.menuItem')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, orderType, tableNumber, deliveryAddress, specialRequests } = req.body;

    // Validate items and calculate total
    const orderItems = await Promise.all(items.map(async (item) => {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.menuItem}`);
      }
      if (!menuItem.available) {
        throw new Error(`Menu item not available: ${menuItem.name}`);
      }
      return {
        menuItem: item.menuItem,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions
      };
    }));

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      orderType,
      tableNumber,
      deliveryAddress,
      specialRequests
    });

    // Calculate estimated delivery time
    const now = new Date();
    const estimatedTime = new Date(now.getTime() + (30 * 60000)); // 30 minutes from now
    order.estimatedDeliveryTime = estimatedTime;

    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem')
      .populate('user', 'name email');
    
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel order
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    if (['preparing', 'ready', 'delivered'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel order in current status' });
    }

    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update payment status (admin only)
router.patch('/:id/payment', adminAuth, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    ).populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const { Order, OrderItem, MenuItem } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all orders (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, orderType } = req.query;
    let where = {};

    if (status) {
      where.status = status;
    }

    if (orderType) {
      where.orderType = orderType;
    }

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: MenuItem,
            attributes: ['name', 'price']
          }]
        }
      ],
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
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: MenuItem,
            attributes: ['name', 'price']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
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
    let totalAmount = 0;
    const orderItems = await Promise.all(items.map(async (item) => {
      const menuItem = await MenuItem.findByPk(item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.menuItemId}`);
      }
      if (!menuItem.available) {
        throw new Error(`Menu item not available: ${menuItem.name}`);
      }
      totalAmount += menuItem.price * item.quantity;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions
      };
    }));

    const order = await Order.create({
      userId: req.user.id,
      orderType,
      tableNumber,
      deliveryAddress,
      specialRequests,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Create order items
    await Promise.all(orderItems.map(item => 
      OrderItem.create({
        ...item,
        orderId: order.id
      })
    ));

    // Fetch the complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: MenuItem,
            attributes: ['name', 'price']
          }]
        }
      ]
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: MenuItem,
            attributes: ['name', 'price']
          }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update({ status });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel order
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: MenuItem,
            attributes: ['name', 'price']
          }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    if (!['pending', 'preparing'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel order in current status' });
    }

    await order.update({ 
      status: 'cancelled',
      paymentStatus: order.paymentStatus === 'paid' ? 'refund_pending' : 'cancelled'
    });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
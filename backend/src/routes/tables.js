const express = require('express');
const router = express.Router();
const { Table, User, Order } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all tables - public access allowed
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all tables');
    // For public access, only return basic table information
    const tables = await Table.findAll({
      attributes: ['id', 'number', 'capacity', 'status'],
      order: [['number', 'ASC']]
    });
    console.log('Found tables:', tables.length);
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get table status - requires authentication
router.get('/status', auth, async (req, res) => {
  try {
    const tables = await Table.findAll({
      include: [
        {
          model: User,
          as: 'waiter',
          attributes: ['id', 'name']
        },
        {
          model: Order,
          as: 'currentOrder',
          include: ['items']
        }
      ],
      order: [['number', 'ASC']]
    });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign table to waiter
router.post('/:id/assign', auth, async (req, res) => {
  try {
    if (req.user.role !== 'waiter' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    if (table.status !== 'available') {
      return res.status(400).json({ error: 'Table is not available' });
    }

    await table.update({
      waiterId: req.user.id,
      status: 'occupied'
    });

    const updatedTable = await Table.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'waiter',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json(updatedTable);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Release table
router.post('/:id/release', auth, async (req, res) => {
  try {
    if (req.user.role !== 'waiter' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    if (table.status !== 'occupied') {
      return res.status(400).json({ error: 'Table is not occupied' });
    }

    if (table.currentOrderId) {
      return res.status(400).json({ error: 'Table has an active order' });
    }

    await table.update({
      waiterId: null,
      status: 'available'
    });

    res.json({ message: 'Table released successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update table
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    await table.update(req.body);
    
    const updatedTable = await Table.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'waiter',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json(updatedTable);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
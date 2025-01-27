const express = require('express');
const router = express.Router();
const { Inventory } = require('../models');
const { auth } = require('../middleware/auth');
const { Op, Sequelize } = require('sequelize');

// Get all inventory items
router.get('/', auth, async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      order: [['name', 'ASC']]
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get inventory status (for dashboard)
router.get('/status', auth, async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      where: {
        quantity: {
          [Op.lte]: Sequelize.col('minThreshold')
        }
      },
      order: [['quantity', 'ASC']]
    });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new inventory item
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update inventory item
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete inventory item
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const item = await Inventory.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await item.destroy();
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
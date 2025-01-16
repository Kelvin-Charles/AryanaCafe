const express = require('express');
const router = express.Router();
const { MenuItem } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const { category, dietary } = req.query;
    let where = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (dietary && dietary !== 'all') {
      where.dietary = {
        [Op.contains]: [dietary]
      };
    }

    const menuItems = await MenuItem.findAll({ where });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get menu item by id
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create menu item (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const menuItem = await MenuItem.create(req.body);
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update menu item (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    await menuItem.update(req.body);
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete menu item (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    await menuItem.destroy();
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
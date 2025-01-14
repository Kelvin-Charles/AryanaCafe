const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new menu item (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      dietaryInfo,
      preparationTime
    } = req.body;

    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      image,
      dietaryInfo,
      preparationTime
    });

    await menuItem.save();
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
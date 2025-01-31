const express = require('express');
const router = express.Router();
const { MenuItem, Category } = require('../models');

// Get all menu items with their categories
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.findAll({
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [
        ['categoryId', 'ASC'],
        ['name', 'ASC']
      ]
    });
    res.json({ menuItems });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Error fetching menu items', error: error.message });
  }
});

// Get menu items by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const menuItems = await MenuItem.findAll({
      where: { categoryId },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['name', 'ASC']]
    });
    res.json({ menuItems });
  } catch (error) {
    console.error('Error fetching menu items by category:', error);
    res.status(500).json({ message: 'Error fetching menu items', error: error.message });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['displayOrder', 'ASC']]
    });
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

module.exports = router; 
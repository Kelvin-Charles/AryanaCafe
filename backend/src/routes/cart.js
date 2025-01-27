const express = require('express');
const router = express.Router();
const { MenuItem } = require('../models');
const { auth } = require('../middleware/auth');

// Initialize cart storage (in-memory for now)
const userCarts = new Map();

// Get cart items
router.get('/', auth, async (req, res) => {
  try {
    const cart = userCarts.get(req.user.id) || [];
    
    // Fetch full menu item details for each cart item
    const cartWithDetails = await Promise.all(
      cart.map(async (item) => {
        const menuItem = await MenuItem.findByPk(item.menuItemId);
        return {
          ...menuItem.toJSON(),
          quantity: item.quantity
        };
      })
    );
    
    res.json(cartWithDetails);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to cart
router.post('/items', auth, async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;

    // Validate menu item exists
    const menuItem = await MenuItem.findByPk(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Get user's cart or create new one
    let cart = userCarts.get(req.user.id) || [];

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.menuItemId === menuItemId);

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item if it doesn't exist
      cart.push({ menuItemId, quantity });
    }

    // Update cart in storage
    userCarts.set(req.user.id, cart);

    res.status(200).json({ message: 'Item added to cart successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cart item quantity
router.put('/items', auth, async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    let cart = userCarts.get(req.user.id) || [];
    const itemIndex = cart.findIndex(item => item.menuItemId === menuItemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    cart[itemIndex].quantity = quantity;
    userCarts.set(req.user.id, cart);

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from cart
router.delete('/items/:menuItemId', auth, async (req, res) => {
  try {
    const { menuItemId } = req.params;
    let cart = userCarts.get(req.user.id) || [];

    cart = cart.filter(item => item.menuItemId !== parseInt(menuItemId));
    userCarts.set(req.user.id, cart);

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear cart
router.delete('/', auth, async (req, res) => {
  try {
    userCarts.delete(req.user.id);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
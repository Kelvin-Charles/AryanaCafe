const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all users (admin and manager only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all staff members (manager only)
router.get('/staff', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const staff = await User.findAll({
      where: {
        role: {
          [Op.in]: ['waiter', 'chef']
        }
      },
      attributes: { exclude: ['password'] }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all waiters
router.get('/waiters', auth, async (req, res) => {
  try {
    const waiters = await User.findAll({
      where: { role: 'waiter' },
      attributes: { exclude: ['password'] }
    });
    res.json(waiters);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all chefs
router.get('/chefs', auth, async (req, res) => {
  try {
    const chefs = await User.findAll({
      where: { role: 'chef' },
      attributes: { exclude: ['password'] }
    });
    res.json(chefs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    await user.update(req.body);
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user by ID (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.update(req.body);
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
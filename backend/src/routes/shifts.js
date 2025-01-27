const express = require('express');
const router = express.Router();
const { Shift, User } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all shifts
router.get('/', auth, async (req, res) => {
  try {
    const shifts = await Shift.findAll({
      include: [{
        model: User,
        attributes: ['id', 'name', 'role']
      }],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new shift
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { staffId, date, startTime, endTime } = req.body;

    // Validate staff exists
    const staff = await User.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const shift = await Shift.create({
      staffId,
      date,
      startTime,
      endTime
    });

    const shiftWithStaff = await Shift.findByPk(shift.id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'role']
      }]
    });

    res.status(201).json(shiftWithStaff);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update shift
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const shift = await Shift.findByPk(req.params.id);
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    await shift.update(req.body);
    
    const updatedShift = await Shift.findByPk(shift.id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'role']
      }]
    });

    res.json(updatedShift);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete shift
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const shift = await Shift.findByPk(req.params.id);
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    await shift.destroy();
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
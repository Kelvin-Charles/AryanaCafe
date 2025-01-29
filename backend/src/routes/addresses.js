const express = require('express');
const router = express.Router();
const { CustomerAddress } = require('../models');
const { auth } = require('../middleware/auth');

// Get all addresses for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching addresses for user:', req.user.id);
    const addresses = await CustomerAddress.findAll({
      where: { UserId: req.user.id }
    });
    console.log('Found addresses:', addresses.length);
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new address for the authenticated user
router.post('/', auth, async (req, res) => {
  try {
    const { street, city, state, zipCode, isDefault } = req.body;
    const newAddress = await CustomerAddress.create({
      UserId: req.user.id,
      street,
      city,
      state,
      zip_code: zipCode,
      is_default: isDefault
    });
    res.status(201).json(newAddress);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update an address by ID for the authenticated user
router.put('/:id', auth, async (req, res) => {
  try {
    const address = await CustomerAddress.findOne({
      where: { id: req.params.id, UserId: req.user.id }
    });
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    await address.update(req.body);
    res.json(address);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an address by ID for the authenticated user
router.delete('/:id', auth, async (req, res) => {
  try {
    const address = await CustomerAddress.findOne({
      where: { id: req.params.id, UserId: req.user.id }
    });
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    await address.destroy();
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
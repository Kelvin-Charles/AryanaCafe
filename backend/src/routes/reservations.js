const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { auth, adminAuth } = require('../middleware/auth');

// Get all reservations (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { date, status } = req.query;
    let query = {};

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    if (status) {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
      .populate('user', 'name email')
      .sort({ date: 1, time: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's reservations
router.get('/my-reservations', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .sort({ date: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create reservation
router.post('/', auth, async (req, res) => {
  try {
    const { date, time, guests, specialRequests, contactInfo } = req.body;

    // Check if the time slot is available
    const existingReservation = await Reservation.findOne({
      date,
      time,
      status: { $ne: 'cancelled' }
    });

    if (existingReservation) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    const reservation = new Reservation({
      user: req.user._id,
      date,
      time,
      guests,
      specialRequests,
      contactInfo
    });

    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update reservation status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel reservation
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ error: 'Reservation is already cancelled' });
    }

    // Check if cancellation is within allowed time (e.g., 2 hours before)
    const reservationTime = new Date(reservation.date);
    const now = new Date();
    const timeDiff = reservationTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 2) {
      return res.status(400).json({ error: 'Cannot cancel reservation less than 2 hours before the booking time' });
    }

    reservation.status = 'cancelled';
    await reservation.save();
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available time slots for a date
router.get('/available-times', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const reservations = await Reservation.find({
      date: { $gte: startDate, $lt: endDate },
      status: { $ne: 'cancelled' }
    }).select('time -_id');

    const bookedTimes = reservations.map(r => r.time);
    const allTimes = [
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
      '20:00', '20:30', '21:00'
    ];

    const availableTimes = allTimes.filter(time => !bookedTimes.includes(time));
    res.json(availableTimes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
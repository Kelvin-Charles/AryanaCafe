const express = require('express');
const router = express.Router();
const { Reservation } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all reservations (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { date, status } = req.query;
    let where = {};

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (status) {
      where.status = status;
    }

    const reservations = await Reservation.findAll({
      where,
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's reservations
router.get('/my-reservations', auth, async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']]
    });
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
      where: {
        date,
        time,
        status: {
          [Op.ne]: 'cancelled'
        }
      }
    });

    if (existingReservation) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    const reservation = await Reservation.create({
      userId: req.user.id,
      date,
      time,
      guests,
      specialRequests,
      contactInfo,
      status: 'pending'
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update reservation status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findByPk(req.params.id);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    await reservation.update({ status });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel reservation
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ error: 'Reservation is already cancelled' });
    }

    // Check if cancellation is within allowed time (e.g., 2 hours before)
    const reservationTime = new Date(`${reservation.date}T${reservation.time}`);
    const now = new Date();
    const timeDiff = reservationTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 2) {
      return res.status(400).json({ 
        error: 'Reservations can only be cancelled at least 2 hours before the scheduled time' 
      });
    }

    await reservation.update({ status: 'cancelled' });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
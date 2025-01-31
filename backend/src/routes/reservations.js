const express = require('express');
const router = express.Router();
const { Reservation, Table, Order, OrderItem, MenuItem } = require('../models');
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
      include: [{
        model: Order,
        include: [{
          model: OrderItem,
          as: 'items',
          include: [MenuItem]
        }]
      }],
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
    console.log('Fetching reservations for user:', {
      UserId: req.user.id,
      name: req.user.name,
      email: req.user.email
    });

    const reservations = await Reservation.findAll({
      where: { 
        UserId: req.user.id
      },
      include: [{
        model: Order,
        include: [{
          model: OrderItem,
          as: 'items',
          include: [MenuItem]
        }]
      }],
      order: [['date', 'DESC'], ['time', 'ASC']]
    });

    console.log('Found reservations:', {
      count: reservations.length,
      reservationIds: reservations.map(r => r.id)
    });

    // Transform the data to include only necessary information
    const transformedReservations = reservations.map(reservation => ({
      id: reservation.id,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      status: reservation.status,
      specialRequests: reservation.specialRequests,
      contactInfo: reservation.contactInfo,
      Order: reservation.Order ? {
        id: reservation.Order.id,
        status: reservation.Order.status,
        items: reservation.Order.items
      } : null
    }));

    res.json(transformedReservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Create reservation
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating reservation with data:', {
      UserId: req.user.id,
      ...req.body,
      userInfo: {
        name: req.user.name,
        email: req.user.email
      }
    });

    const { date, time, guests, specialRequests, contactInfo, OrderId } = req.body;

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
      console.log('Time slot already booked:', {
        date,
        time,
        existingReservationId: existingReservation.id
      });
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    // Create the reservation
    const reservation = await Reservation.create({
      UserId: req.user.id,
      date,
      time,
      guests,
      specialRequests,
      contactInfo,
      OrderId,
      status: 'pending'
    });

    console.log('Reservation created successfully:', {
      id: reservation.id,
      UserId: reservation.UserId,
      date: reservation.date,
      time: reservation.time,
      OrderId: reservation.OrderId
    });

    // Fetch the complete reservation with order details
    const completeReservation = await Reservation.findByPk(reservation.id, {
      include: [{
        model: Order,
        include: [{
          model: OrderItem,
          as: 'items',
          include: [MenuItem]
        }]
      }]
    });

    res.status(201).json(completeReservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
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
        UserId: req.user.id
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

// Check availability for a given date and time - public access allowed
router.get('/check-availability', async (req, res) => {
  try {
    const { date, time, guests } = req.query;
    console.log('Checking availability with params:', { date, time, guests });
    
    if (!date) {
      console.log('Date is required but not provided');
      return res.status(400).json({ error: 'Date is required' });
    }

    // Get all tables
    const tables = await Table.findAll({
      attributes: ['id', 'number', 'capacity', 'status']
    });
    console.log('Found tables:', tables.length);

    if (!tables.length) {
      console.log('No tables found in the system');
      return res.status(404).json({ error: 'No tables are configured in the system' });
    }

    // Get available time slots (30 min intervals from 11 AM to 10 PM)
    const timeSlots = [];
    const startTime = new Date(`${date}T11:00:00`);
    const endTime = new Date(`${date}T22:00:00`);
    
    let currentTime = startTime;
    while (currentTime <= endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      
      // Get existing reservations for this time slot
      const existingReservations = await Reservation.findAll({
        where: {
          date,
          time: timeString,
          status: {
            [Op.ne]: 'cancelled'
          }
        }
      });
      console.log(`Found ${existingReservations.length} reservations for time ${timeString}`);

      // Calculate available tables for this time slot
      const availableTables = tables.filter(table => {
        // Check if table is already reserved
        const isReserved = existingReservations.some(reservation => 
          reservation.tableId === table.id
        );
        // Check if table has enough capacity if guests parameter is provided
        const hasCapacity = !guests || table.capacity >= parseInt(guests);
        return !isReserved && table.status === 'available' && hasCapacity;
      });

      timeSlots.push({
        time: timeString,
        available: availableTables.length > 0,
        availableTables: availableTables.length,
        tables: availableTables.map(table => ({
          id: table.id,
          number: table.number,
          capacity: table.capacity
        }))
      });

      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    const response = {
      date,
      timeSlots,
      message: timeSlots.some(slot => slot.available) 
        ? 'Available time slots found'
        : 'No available time slots for the selected date'
    };
    console.log('Sending response with time slots:', timeSlots.length);
    res.json(response);
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

module.exports = router; 
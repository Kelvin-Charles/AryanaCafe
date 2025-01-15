const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  guests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 20
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
    defaultValue: 'pending'
  },
  special_requests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contact_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact_email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  contact_phone: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'reservations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'reservation_date_time_status',
      unique: true,
      fields: ['date', 'time', 'status']
    }
  ]
});

// Add validation hook to prevent double booking
Reservation.addHook('beforeValidate', async (reservation) => {
  if (reservation.status === 'confirmed') {
    const existingReservation = await Reservation.findOne({
      where: {
        date: reservation.date,
        time: reservation.time,
        status: 'confirmed',
        id: { [DataTypes.Op.ne]: reservation.id }
      }
    });
    if (existingReservation) {
      throw new Error('This time slot is already booked');
    }
  }
});

module.exports = Reservation; 
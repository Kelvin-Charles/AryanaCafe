require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const reservationRoutes = require('./routes/reservations');
const orderRoutes = require('./routes/orders');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Connect to MySQL and start server
const startServer = async () => {
  try {
    // Test the connection first
    await sequelize.authenticate();
    console.log('Connected to MySQL database');

    // Drop existing tables
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.drop();
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('All tables dropped');
    
    // Create tables in correct order
    await sequelize.sync();
    console.log('Database synchronized');

    // Create initial dietary options
    const { DietaryOption } = require('./models');
    await DietaryOption.bulkCreate([
      { name: 'Vegetarian', description: 'No meat or fish' },
      { name: 'Vegan', description: 'No animal products' },
      { name: 'Gluten-free', description: 'No gluten-containing ingredients' },
      { name: 'Dairy-free', description: 'No dairy products' }
    ], { ignoreDuplicates: true });
    console.log('Initial dietary options created');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
};

startServer(); 
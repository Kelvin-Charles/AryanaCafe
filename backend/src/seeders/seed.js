const { sequelize } = require('../config/database');
const { MenuItem, User, DietaryOption } = require('../models');
const menuItems = require('./menuItems');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    // Disable foreign key checks for SQLite
    await sequelize.query('PRAGMA foreign_keys = OFF');

    // Sync database with force true to drop all tables
    await sequelize.sync({ force: true });

    // Re-enable foreign key checks
    await sequelize.query('PRAGMA foreign_keys = ON');

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@aryanacafe.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Create test user
    const userPassword = await bcrypt.hash('test123', 10);
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: userPassword,
      role: 'user'
    });

    // Create menu items
    await MenuItem.bulkCreate(menuItems);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 
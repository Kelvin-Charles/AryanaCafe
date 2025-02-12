const { sequelize } = require('../config/database');
const { MenuItem, User, Order, OrderItem, Reservation, Table } = require('../models');
const menuItems = require('./menuItems');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    // Disable foreign key checks for MySQL
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Sync database with force true to drop all tables
    await sequelize.sync({ force: true });

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Create users with different roles
    const users = await User.bulkCreate([
      {
        name: 'Admin User',
        email: 'admin@aryanacafe.com',
        password: await bcrypt.hash('Admin@123', 10),
        role: 'admin'
      },
      {
        name: 'Manager User',
        email: 'manager@aryanacafe.com',
        password: await bcrypt.hash('Manager@123', 10),
        role: 'manager'
      },
      {
        name: 'Waiter User',
        email: 'waiter@aryanacafe.com',
        password: await bcrypt.hash('Waiter@123', 10),
        role: 'waiter'
      },
      {
        name: 'Chef User',
        email: 'chef@aryanacafe.com',
        password: await bcrypt.hash('Chef@123', 10),
        role: 'chef'
      },
      {
        name: 'Test Customer',
        email: 'customer@example.com',
        password: await bcrypt.hash('Customer@123', 10),
        role: 'customer'
      }
    ]);

    // Create menu items
    const createdMenuItems = await MenuItem.bulkCreate(menuItems);

    // Create sample orders
    const orders = await Order.bulkCreate([
      {
        UserId: users[4].id, // Customer's order
        customerName: users[4].name,
        customerEmail: users[4].email,
        status: 'delivered',
        orderType: 'dine-in',
        totalAmount: 25.98,
        paymentStatus: 'paid',
        tableNumber: 5,
        specialRequests: 'No onions please',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        UserId: users[4].id,
        customerName: users[4].name,
        customerEmail: users[4].email,
        status: 'preparing',
        orderType: 'delivery',
        totalAmount: 42.97,
        paymentStatus: 'paid',
        deliveryAddress: JSON.stringify({
          street: '123 Main St',
          city: 'Cityville',
          state: 'ST',
          zipCode: '12345'
        }),
        createdAt: new Date()
      },
      {
        UserId: users[4].id,
        customerName: users[4].name,
        customerEmail: users[4].email,
        status: 'pending',
        orderType: 'takeaway',
        totalAmount: 18.99,
        paymentStatus: 'pending',
        createdAt: new Date()
      }
    ]);

    // Create order items for each order
    await OrderItem.bulkCreate([
      {
        orderId: orders[0].id,
        menuItemId: createdMenuItems[0].id,
        quantity: 2,
        price: createdMenuItems[0].price,
        specialInstructions: 'Extra hot'
      },
      {
        orderId: orders[0].id,
        menuItemId: createdMenuItems[2].id,
        quantity: 1,
        price: createdMenuItems[2].price
      },
      {
        orderId: orders[1].id,
        menuItemId: createdMenuItems[4].id,
        quantity: 2,
        price: createdMenuItems[4].price
      },
      {
        orderId: orders[2].id,
        menuItemId: createdMenuItems[5].id,
        quantity: 1,
        price: createdMenuItems[5].price
      }
    ]);

    // Create sample reservations
    await Reservation.bulkCreate([
      {
        UserId: users[4].id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        time: '19:00',
        guests: 4,
        status: 'confirmed',
        specialRequests: 'Window seat preferred',
        contactInfo: JSON.stringify({
          phone: '123-456-7890',
          email: 'customer@example.com'
        })
      },
      {
        UserId: users[4].id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        time: '20:00',
        guests: 2,
        status: 'pending',
        specialRequests: 'Anniversary celebration',
        contactInfo: JSON.stringify({
          phone: '123-456-7890',
          email: 'customer@example.com'
        })
      },
      {
        UserId: users[4].id,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        time: '18:30',
        guests: 6,
        status: 'completed',
        contactInfo: JSON.stringify({
          phone: '123-456-7890',
          email: 'customer@example.com'
        })
      }
    ]);

    // Create tables
    const tables = await Table.bulkCreate([
      {
        number: 1,
        capacity: 2,
        status: 'available'
      },
      {
        number: 2,
        capacity: 2,
        status: 'available'
      },
      {
        number: 3,
        capacity: 4,
        status: 'available'
      },
      {
        number: 4,
        capacity: 4,
        status: 'available'
      },
      {
        number: 5,
        capacity: 6,
        status: 'available'
      },
      {
        number: 6,
        capacity: 6,
        status: 'available'
      },
      {
        number: 7,
        capacity: 8,
        status: 'available'
      },
      {
        number: 8,
        capacity: 8,
        status: 'available'
      }
    ]);

    console.log('Tables seeded successfully');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 
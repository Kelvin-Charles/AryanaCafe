const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',  // XAMPP's default has no password
  database: process.env.DB_NAME || 'aryana_cafe',
  logging: false
});

module.exports = { sequelize }; 
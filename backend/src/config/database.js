const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('aryana_cafe', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  },
  sync: {
    alter: false, // Prevent automatic table modifications
    force: false  // Prevent dropping tables
  }
});

module.exports = {
  sequelize,
  Sequelize
}; 
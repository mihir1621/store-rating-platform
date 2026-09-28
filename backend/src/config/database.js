const { Sequelize } = require('sequelize');

async function initDatabase() {
  // SQLite creates the file automatically, so we don't need manual creation logic like MySQL
  console.log('Using SQLite database.');
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // This will create a file named database.sqlite in the backend folder
  logging: false,
});

module.exports = { sequelize, initDatabase };

require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

async function initDatabase() {
  try {
    // Only attempt to auto-create the database if we are NOT on Vercel
    if (!process.env.VERCEL) {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'store_rating_platform'}\`;`);
      await connection.end();
    }
    console.log('Using MySQL database.');
  } catch (error) {
    console.warn('Could not auto-create database (this is normal on managed remote databases). Continuing...');
  }
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'store_rating_platform',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      // Required for TiDB Cloud and many remote MySQL providers
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

module.exports = { sequelize, initDatabase };

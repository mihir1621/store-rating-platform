require('dotenv').config();
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

async function initDatabase() {
  try {
    if (!process.env.VERCEL && !process.env.DATABASE_URL) {
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

// Support both DATABASE_URL and individual credentials
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'mysql',
      logging: false,
      dialectModule: require('mysql2'), // CRITICAL for Vercel Serverless
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'store_rating_platform',
      process.env.DB_USER || 'root',
      process.env.DB_PASS || '',
      {
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        dialectModule: require('mysql2'), // CRITICAL for Vercel Serverless
        dialectOptions: {
          ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      }
    );

module.exports = { sequelize, initDatabase };

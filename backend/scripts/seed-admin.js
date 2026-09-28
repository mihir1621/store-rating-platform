require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, initDatabase } = require('../src/config/database');
const { User } = require('../src/models');

async function seedAdmin() {
  try {
    await initDatabase();
    await sequelize.sync();

    const existing = await User.findOne({ where: { email: 'admin@example.com' } });
    if (existing) {
      console.log('Admin user already exists, skipping.');
      process.exit(0);
    }

    const hashed = await bcrypt.hash('Admin@123', 10);
    await User.create({
      name: 'System Administrator Account',
      email: 'admin@example.com',
      password: hashed,
      address: '123 Admin Street, City, Country',
      role: 'admin',
    });

    console.log('Admin user created!');
    console.log('  Email: admin@example.com');
    console.log('  Password: Admin@123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedAdmin();

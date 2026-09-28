require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, initDatabase } = require('../src/config/database');
const { User } = require('../src/models');

async function seedUser() {
  try {
    await initDatabase();
    await sequelize.sync();

    const hashed = await bcrypt.hash('User@123', 10);
    const existing = await User.findOne({ where: { email: 'user@gmail.com' } });
    
    if (existing) {
      await existing.update({ password: hashed });
      console.log('Normal user updated successfully with new password User@123');
    } else {
      await User.create({
        name: 'Normal User Account For Testing',
        email: 'user@gmail.com',
        password: hashed,
        address: '456 User Avenue, Tech City',
        role: 'user',
      });
      console.log('Normal user created successfully!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedUser();

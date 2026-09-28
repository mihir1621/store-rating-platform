require('dotenv').config();
const { sequelize, initDatabase } = require('../src/config/database');
const { Store, User } = require('../src/models');
const bcrypt = require('bcryptjs');

const storeNames = [
  "Tech Haven", "Fresh Market", "Book Nook", "Coffee Corner", "Fashion Boutique",
  "Gadget Galaxy", "Green Grocer", "Readers Retreat", "Brew Haven", "Style Studio",
  "Electro World", "Nature's Best", "Page Turner", "Bean Scene", "Trend Setter",
  "Digital Dreams", "Farm Fresh", "Story Time", "Mug Shot", "Chic Boutique",
  "Smart Home", "Organic Oasis", "Bookworm's Paradise", "Cafe Latte", "Vogue Vault",
  "Byte Size", "Harvest Moon", "Novel Idea", "Espresso Express", "Couture Corner",
  "Circuit City", "Healthy Harvest", "Literature Lounge", "Mocha Magic", "Glamour Grove",
  "Tech Town", "Veggie Village", "Paperback Place", "Roast & Toast", "Elegance Emporium",
  "Appliance Alley", "Fruit Fusion", "Chapter One", "Sip & Savor", "Dapper Den",
  "Computer Cove", "Wholesome Hub", "Epic Reads", "Caffeine Fix", "Urban Outfitters"
];

async function seedStores() {
  try {
    await initDatabase();
    await sequelize.sync();

    // Create a dummy owner to own all these stores
    let owner = await User.findOne({ where: { email: 'bigowner@example.com' } });
    if (!owner) {
      const hashed = await bcrypt.hash('Password@123', 10);
      owner = await User.create({
        name: 'The Big Mega Store Owner',
        email: 'bigowner@example.com',
        password: hashed,
        address: '999 Business Blvd, Mega City',
        role: 'owner',
      });
      console.log('Created owner user: bigowner@example.com');
    }

    const currentStoreCount = await Store.count();
    if (currentStoreCount >= 50) {
      console.log('Stores already seeded!');
      process.exit(0);
    }

    const storesToCreate = [];
    for (let i = 0; i < 50; i++) {
      storesToCreate.push({
        name: storeNames[i] || `Store ${i + 1}`,
        email: `contact${i + 1}@${(storeNames[i] || 'store').replace(/\s+/g, '').toLowerCase()}.com`,
        address: `${100 + i} Main Street, City ${i % 5}`,
        ownerId: owner.id
      });
    }

    await Store.bulkCreate(storesToCreate);
    console.log(`Successfully added 50 dummy stores!`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedStores();

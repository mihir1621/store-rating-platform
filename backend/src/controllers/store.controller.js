const { Op } = require('sequelize');
const { Store, Rating } = require('../models');
const { sequelize } = require('../config/database');

// GET /api/stores — all logged-in users, with avg rating + user's own rating
exports.getStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', order = 'ASC' } = req.query;
    const userId = req.user.id;

    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const allowedSort = ['name', 'email', 'address', 'createdAt'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'name';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({
      where,
      order: [[safeSortBy, safeOrder]],
      include: [
        {
          model: Rating,
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [sequelize.fn('AVG', sequelize.col('Ratings.value')), 'avgRating'],
          [sequelize.fn('COUNT', sequelize.col('Ratings.id')), 'totalRatings'],
        ],
      },
      group: ['Store.id'],
      subQuery: false,
    });

    // get the current user's ratings for all stores
    const userRatings = await Rating.findAll({ where: { userId } });
    const ratingMap = {};
    userRatings.forEach(r => {
      ratingMap[r.storeId] = { id: r.id, value: r.value };
    });

    const result = stores.map(s => {
      const json = s.toJSON();
      return {
        ...json,
        avgRating: json.avgRating ? parseFloat(json.avgRating).toFixed(1) : null,
        totalRatings: parseInt(json.totalRatings) || 0,
        userRating: ratingMap[s.id] || null,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/stores — admin only
exports.createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const existing = await Store.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'A store with this email already exists' });
    }

    const store = await Store.create({ name, email, address, ownerId: ownerId || null });
    res.status(201).json({ message: 'Store created', store });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: err.message });
  }
};

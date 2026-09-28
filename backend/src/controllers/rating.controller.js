const { Rating, Store, User } = require('../models');

// POST /api/ratings — normal user submits a rating
exports.submitRating = async (req, res) => {
  try {
    const { storeId, value } = req.body;
    const userId = req.user.id;

    // check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) return res.status(404).json({ error: 'Store not found' });

    // check if user already rated this store
    const existing = await Rating.findOne({ where: { storeId, userId } });
    if (existing) {
      return res.status(400).json({ error: 'You have already rated this store. Use the edit option.' });
    }

    const rating = await Rating.create({ storeId, userId, value });
    res.status(201).json({ message: 'Rating submitted', rating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/ratings/:id — normal user updates their own rating
exports.updateRating = async (req, res) => {
  try {
    const rating = await Rating.findByPk(req.params.id);
    if (!rating) return res.status(404).json({ error: 'Rating not found' });

    // make sure it belongs to the current user
    if (rating.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own ratings' });
    }

    rating.value = req.body.value;
    await rating.save();
    res.json({ message: 'Rating updated', rating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/ratings/my-store — store owner sees ratings for their store
exports.getMyStoreRatings = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) return res.status(404).json({ error: 'No store found for your account' });

    const { sortBy = 'createdAt', order = 'DESC' } = req.query;

    const allowedSort = ['createdAt', 'value'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [[safeSortBy, safeOrder]],
    });

    // also get the average
    const { sequelize } = require('../config/database');
    const avgResult = await Rating.findOne({
      where: { storeId: store.id },
      attributes: [[sequelize.fn('AVG', sequelize.col('value')), 'avgRating']],
      raw: true,
    });

    res.json({
      storeName: store.name,
      avgRating: avgResult.avgRating ? parseFloat(avgResult.avgRating).toFixed(1) : null,
      ratings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Store, Rating } = require('../models');
const { sequelize } = require('../config/database');

// GET /api/users — admin only, with filters + sorting
exports.getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', order = 'ASC' } = req.query;

    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };
    if (role) where.role = role;

    const allowedSort = ['name', 'email', 'address', 'role', 'createdAt'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'name';
    const safeOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const users = await User.findAll({
      where,
      order: [[safeSortBy, safeOrder]],
      attributes: { exclude: ['password'] },
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:id — admin only, user detail
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const result = user.toJSON();

    // if user is a store owner, include their store's average rating
    if (user.role === 'owner') {
      const store = await Store.findOne({ where: { ownerId: user.id } });
      if (store) {
        const avgResult = await Rating.findOne({
          where: { storeId: store.id },
          attributes: [
            [sequelize.fn('AVG', sequelize.col('value')), 'avgRating'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings'],
          ],
          raw: true,
        });
        result.store = {
          id: store.id,
          name: store.name,
          avgRating: avgResult.avgRating ? parseFloat(avgResult.avgRating).toFixed(1) : null,
          totalRatings: parseInt(avgResult.totalRatings) || 0,
        };
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users — admin creates a user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, address, role });

    res.status(201).json({
      message: 'User created',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/users/password — any logged-in user updates own password
exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/users/:id — admin only, delete user
exports.deleteUser = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    // Prevent admin from deleting their own account
    if (id === req.user.id) {
      await t.rollback();
      return res.status(400).json({ error: 'You cannot delete your own administrator account.' });
    }

    const user = await User.findByPk(id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    // 1. If user is store owner, set ownerId to null in associated stores
    if (user.role === 'owner') {
      await Store.update({ ownerId: null }, { where: { ownerId: id }, transaction: t });
    }

    // 2. Delete all ratings submitted by this user
    await Rating.destroy({ where: { userId: id }, transaction: t });

    // 3. Delete the user
    await user.destroy({ transaction: t });

    await t.commit();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

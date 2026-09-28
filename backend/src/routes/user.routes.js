const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { getUsers, getUserById, createUser, updatePassword, deleteUser } = require('../controllers/user.controller');
const { createUserValidation, passwordChangeValidation, handleValidation } = require('../middleware/validate.middleware');

// admin-only user management
router.get('/', auth, requireRole('admin'), getUsers);
router.get('/:id', auth, requireRole('admin'), getUserById);
router.post('/', auth, requireRole('admin'), createUserValidation, handleValidation, createUser);
router.delete('/:id', auth, requireRole('admin'), deleteUser);

// any logged-in user can change their password
router.patch('/password', auth, passwordChangeValidation, handleValidation, updatePassword);

module.exports = router;

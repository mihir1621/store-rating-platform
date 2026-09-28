const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { getStores, createStore } = require('../controllers/store.controller');
const { storeValidation, handleValidation } = require('../middleware/validate.middleware');

// any logged-in user can view stores
router.get('/', auth, getStores);

// admin creates stores
router.post('/', auth, requireRole('admin'), storeValidation, handleValidation, createStore);

module.exports = router;

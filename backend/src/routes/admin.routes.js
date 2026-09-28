const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { getStats } = require('../controllers/admin.controller');

router.get('/stats', auth, requireRole('admin'), getStats);

module.exports = router;

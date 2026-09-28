const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { submitRating, updateRating, getMyStoreRatings } = require('../controllers/rating.controller');
const { ratingValidation, handleValidation } = require('../middleware/validate.middleware');

// normal user submits/updates rating
router.post('/', auth, requireRole('user'), ratingValidation, handleValidation, submitRating);
router.patch('/:id', auth, requireRole('user'), ratingValidation, handleValidation, updateRating);

// store owner views ratings
router.get('/my-store', auth, requireRole('owner'), getMyStoreRatings);

module.exports = router;

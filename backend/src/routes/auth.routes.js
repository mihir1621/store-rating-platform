const router = require('express').Router();
const { signup, login } = require('../controllers/auth.controller');
const { signupValidation, handleValidation } = require('../middleware/validate.middleware');

router.post('/signup', signupValidation, handleValidation, signup);
router.post('/login', login);

module.exports = router;

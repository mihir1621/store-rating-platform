const { body, validationResult } = require('express-validator');

const nameRules = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be 20-60 characters'),
];

const emailRules = [
  body('email').isEmail().withMessage('Enter a valid email address'),
];

const passwordRules = [
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage('Password must contain at least one special character'),
];

const addressRules = [
  body('address')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters')
    .notEmpty()
    .withMessage('Address is required'),
];

// signup: name + email + password + address
exports.signupValidation = [...nameRules, ...emailRules, ...passwordRules, ...addressRules];

// admin creates user: same as signup + role
exports.createUserValidation = [
  ...nameRules,
  ...emailRules,
  ...passwordRules,
  ...addressRules,
  body('role')
    .isIn(['admin', 'user', 'owner'])
    .withMessage('Role must be admin, user, or owner'),
];

// password change
exports.passwordChangeValidation = [
  body('oldPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be 8-16 characters')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage('New password must contain at least one special character'),
];

// rating
exports.ratingValidation = [
  body('value')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
];

// store creation
exports.storeValidation = [
  body('name').notEmpty().withMessage('Store name is required'),
  body('email').isEmail().withMessage('Enter a valid store email'),
  body('address').notEmpty().withMessage('Store address is required')
    .isLength({ max: 400 }).withMessage('Address must not exceed 400 characters'),
];

// collect validation errors
exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

import { body } from 'express-validator';

const userRegisterValidator = () => {
  return [
    body('fullName')
      .notEmpty()
      .withMessage('Full name is required'),
      
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please enter a valid email address'),

    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),

    body('username')
      .notEmpty()
      .withMessage('Username is required'),
  ];
};

const userLoginValidator = () => {
  return [
    body('username')
      .optional()
      .isString()
      .withMessage('Username must be a string'),

    body('email')
      .optional()
      .isEmail()
      .withMessage('Please enter a valid email address'),

    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ];
};

export { userRegisterValidator, userLoginValidator };

import { body } from 'express-validator';

const userRegisterValidator = () => {
  return [
    body('fullName').isEmpty().withMessage('Full Name Not Empty'),

    body('email')
      .isEmpty()
      .withMessage('Email Field Not be Empty')
      .isEmail()
      .withMessage('Must be Full Proper Email Formate'),

    body('password')
      .isEmpty()
      .withMessage('PassWord Must be field')
      .isLength({ min: 6 })
      .withMessage('atleast have  char '),

    body('username').isEmpty().withMessage('username Field Not be Empty'),
  ];
};

const userLoginValidator = () => {
  return [
    body('username').optional().withMessage('username or email is required'),
    body('email').optional().withMessage('username or email is required'),

    body('password')
      .isEmpty()
      .withMessage('PassWord Must be field')
      .isLength({ min: 6 })
      .withMessage('atleast have  char '),
  ];
};

export { userRegisterValidator ,userLoginValidator };

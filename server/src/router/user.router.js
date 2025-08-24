import { Router } from 'express';
import { userRegisterValidator } from '../validator/index.js';
import { validator } from '../middleware/validator.middleware.js';
import { registerUser } from '../controller/user.controller.js';

const router = Router();



router.post(
  '/register',
  [...userRegisterValidator(), validator],
  registerUser
);

export default router;
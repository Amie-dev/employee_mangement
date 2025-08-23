import { Router } from 'express';
import { userRegisterValidator } from '../validator.js';
import { validatro } from '../middleware/validator.middleware.js';
import { userRegister } from '../controller/user.controller.js';

const router = Router();

router.route('/register').post(userRegisterValidator(), validatro, userRegister);

export default router;
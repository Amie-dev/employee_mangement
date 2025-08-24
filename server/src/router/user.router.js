import { Router } from 'express';
import { userRegisterValidator } from '../validator/index.js';
import { validator } from '../middleware/validator.middleware.js';
import { logInUser, registerUser } from '../controller/user.controller.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();



router.post(
  '/register',
  [...userRegisterValidator(), validator],
  upload.single("avatar"),
  registerUser
);
router.post("/login",logInUser)

export default router;
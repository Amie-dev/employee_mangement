import { Router } from 'express';
import { userRegisterValidator } from '../validator/index.js';
import { validator } from '../middleware/validator.middleware.js';
import {
  changeCurrentPassword,
  emailVerificationsRequest,
  emailVerificationsVerified,
  forgotPasswordRequest,
  getCurrentUser,
  logInUser,
  logOutUser,
  refreshAccessToken,
  registerUser,
  updatedUser,
  verifyForgotPassword,
} from '../controller/user.controller.js';
import { upload } from '../middleware/multer.middleware.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.post(
  '/register',
  // [...userRegisterValidator(), validator],
  upload.single('avatar'),
  registerUser
);
router.post('/login', logInUser);
router.route('/update').patch(verifyJWT, upload.single('avatar'), updatedUser);
router.get('/logout', verifyJWT, logOutUser);
router.get('/refresh-token', refreshAccessToken);
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.get('/c/user', verifyJWT, getCurrentUser);
router.route('/forgot-password').post(forgotPasswordRequest).patch(verifyForgotPassword);
router
  .route('/email-verification')
  .get(verifyJWT, emailVerificationsRequest)
  .patch(emailVerificationsVerified);
export default router;

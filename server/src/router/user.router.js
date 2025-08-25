import { Router } from 'express';
import { userRegisterValidator } from '../validator/index.js';
import { validator } from '../middleware/validator.middleware.js';
import { changeCurrentPassword, getCurrentUser, logInUser, logOutUser, refreshAccessToken, registerUser } from '../controller/user.controller.js';
import { upload } from '../middleware/multer.middleware.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();



router.post(
  '/register',
  [...userRegisterValidator(), validator],
  upload.single("avatar"),
  registerUser
);
router.post("/login",logInUser)
router.get("/logout",verifyJWT,logOutUser)
router.get("/refresh-token",refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.get("/c/user",verifyJWT,getCurrentUser)

export default router;
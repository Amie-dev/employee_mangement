import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { User } from '../model/user.model.js';
import { localFileRemove } from '../middleware/multer.middleware.js';

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;

  if ([username, fullName, email, password].some((field) => !field.trim())) {
    throw new ApiError(400, 'All Filed Are Required');
  }
  const normalizedUsername = username.toLowerCase();
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const existedUser = await User.findOne({
    $or: [{ email }, { username: normalizedUsername }],
  });

  if (existedUser) {
    localFileRemove(avatarLocalPath);
    throw new ApiError(400, 'User already exists with this username or email');
  }

  const user = await User.create({
    username: normalizedUsername,
    fullName,
    email,
    password,
  });
  if (avatarLocalPath) {
    user.avatar.localPath = avatarLocalPath;
  }
  // Prepare sanitized response
  const sanitizedUser = {
    _id: user._id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
  };
  console.log("User created successfully");
  
  res.status(201).json(new ApiResponse(201, sanitizedUser, 'User created successfully'));
});

export { registerUser };

import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { User } from '../model/user.model.js';
import { localFileRemove } from '../middleware/multer.middleware.js';

const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken =await user.generateAccessToken();
  const refreshToken =await user.generateRefreshToken();
  user.refreshToken = refreshToken
   await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};
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
    if (avatarLocalPath) {
      localFileRemove(avatarLocalPath);
    }

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
    avatar: user.avatar.localPath,
  };
  console.log('User created successfully');

  res.status(201).json(new ApiResponse(201, sanitizedUser, 'User created successfully'));
});

 const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    // maxAge: 7 * 24 * 60 * 60 * 1000,
  };

const logInUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(email || username)) {
    throw new ApiError(404, 'Username or email is required');
  }
  const user = await User.findOne({
    $or: [{ email }, { username: username?.toLowerCase() }],
  });
  if (!user) {
    throw new ApiError(400, 'User does not exist with this username or email');
  }
  const isPasswordCorrect = user.isCorrectPassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, 'Wrong password');
  }

  const { accessToken, refreshToken } =await generateAccessAndRefreshTokens(user._id);

  const sanitizedUser = {
    _id: user._id,
    username: user.username,
    email: user.email,
    
  };
  res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('ref', refreshToken, options)
    .json(new ApiResponse(200, sanitizedUser, 'User logIn Succesfully'));
});
export { registerUser, logInUser };

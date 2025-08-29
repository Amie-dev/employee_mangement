import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { User } from '../model/user.model.js';
import { localFileRemove } from '../middleware/multer.middleware.js';
import jwt from 'jsonwebtoken';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import { ProjectMember } from '../model/projectmember.model.js';
import mongoose from 'mongoose';

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  // maxAge: 7 * 24 * 60 * 60 * 1000,
};

const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
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

  let avatar;

  try {
    if (avatarLocalPath) {
      avatar = await uploadOnCloudinary(avatarLocalPath);
    }
    const user = await User.create({
      username: normalizedUsername,
      fullName,
      email,
      password,
    });
    if (avatar) {
      user.avatar = {
        url: avatar.url,
        public_id: avatar.public_id,
      };
    }
    await user.save({ validateBeforeSave: false });
    // Prepare sanitized response
    const sanitizedUser = {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      avatar: avatar,
    };
    console.log('User created successfully');

    res.status(201).json(new ApiResponse(201, sanitizedUser, 'User created successfully'));
  } catch (error) {
    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }

    throw new ApiError(500, error.message || 'User registration failed, uploads rolled back');
  }
});

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

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const sanitizedUser = {
    _id: user._id,
    username: user.username,
    email: user.email,
  };
  res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(new ApiResponse(200, sanitizedUser, 'User logIn Succesfully'));
});

const logOutUser = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'User not authenticated');
  }
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const inComingToken = req.cookies.refreshToken || req.body.refreshToken;
  // console.log("Incoming Refresh Token:", inComingToken);

  if (!inComingToken) {
    throw new ApiError(400, 'User login expired. Please log in again.');
  }

  const decodedToken = jwt.verify(inComingToken, process.env.REFRESH_TOKEN_SECRET);
  // console.log("Decoded Token:", decodedToken);

  const user = await User.findById(decodedToken._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (inComingToken !== user.refreshToken) {
    throw new ApiError(403, 'Refresh token mismatch');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(new ApiResponse(200, {}, 'Tokens refreshed successfully'));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, conframdPassword } = req.body;

  if (oldPassword === newPassword) {
    throw new ApiError(401, 'New password must be different from the old password');
  }

  if (newPassword !== conframdPassword) {
    throw new ApiError(400, 'New password and confirmation do not match');
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(401, 'User not authorized');
  }

  const isPasswordCorrect = await user.isCorrectPassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, 'Incorrect current password');
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  res.status(200).json(new ApiResponse(200, {}, 'Password changed successfully'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'User not authenticated');
  }

  const currentUser = await ProjectMember.findOne({
    user: new mongoose.Types.ObjectId(req.user._id),
  });

  if (!currentUser) {
    return res.status(200).json(new ApiResponse(200, req.user, 'User fetched successfully'));
  }

  const sanitizedUser = await ProjectMember.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(currentUser._id) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'projectDetails',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy', // project owner reference
              foreignField: '_id',
              as: 'projectOwner',
            },
          },
          { $unwind: '$projectOwner' },
        ],
      },
    },
    { $unwind: '$projectDetails' },
    {
      $project: {
        _id: 0,
        role: 1,
        user: {
          username: '$userDetails.username',
          email: '$userDetails.email',
          fullName: '$userDetails.fullName',
          isEmailVerified: '$userDetails.isEmailVerified',
          avatar:'$userDetails.avatar.url',
          createdAt: '$userDetails.createdAt',
        },
        project: {
          projectName: '$projectDetails.name',
          ownerName: '$projectDetails.projectOwner.fullName',
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, sanitizedUser[0] || req.user, 'User fetched successfully'));
});

export {
  registerUser,
  logInUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
};

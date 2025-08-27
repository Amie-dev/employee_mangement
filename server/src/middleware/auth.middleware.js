import { User } from '../model/user.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import { userRoleEnum } from '../utils/constent.js';
import mongoose from 'mongoose';
import { ProjectMember } from '../model/projectmember.model.js';

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace('Bearer ', '');
    if (!token) {
      throw new ApiError(401, 'Unauthorized or you already logout so Login first');
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select('-password -refreshToken ');

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token');
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid access token');
    // console.log(error);
  }
});

// export const requireProjectAdmin=asyncHandler(async(req,_,next)=>{
//   try {
//     const userId=req.user?._id
//     const projectId = req.params.projectId;
//     if (!userId || !projectId) {
//     throw new ApiError(400, "Missing user or project ID.");
//   }
//    const membership = await ProjectMember.findOne({ user: userId, project: projectId });
//    if (!membership || membership.role !== userRoleEnum.PROJECT_ADMIN || userRoleEnum.ADMIN) {
//     throw new ApiError(403, "Access denied. Only project admins or project_admin can perform this action.");
//   }

//   next();
//   } catch (err) {
//     throw new ApiError(500, '',err)
//   }
// })

// role-based access control (RBAC)
export const requireRole = (allowedRoles = []) =>
  asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;
    const {projectId} = req.params;
 
 
    if (!userId || !projectId) {
      throw new ApiError(400, 'Missing user or project ID.');
    }


    const membership = await ProjectMember.findOne({ 
      user:new mongoose.Types.ObjectId(userId),
       project: new mongoose.Types.ObjectId(projectId)
      });
    // console.log(membership);

    const givenRole=membership.role

    req.user.role=givenRole

    if (!allowedRoles.includes(givenRole)) {
      throw new ApiError(
        403,
        'Access denied. Only project admins or project_admin can perform this action.'
      );
    }

    next();
  });

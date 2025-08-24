import { User } from "../model/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHAndler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

export const verifyJWT=asyncHAndler(async(req,resizeBy,next)=>{
    try {
        const token=req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
      throw new ApiError(401, "Unauthorized or you already logout so Login first");
    }
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken "
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
        console.log(error);
        
    }
})
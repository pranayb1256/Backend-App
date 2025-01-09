import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const jwtverify = asyncHandler(async(req,res)=>
{
    try
    {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer","")
        if (!token)
        {
            throw new ApiError(400,"Unauthorized access");
        }
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECERT)
        const user = await User.findOne(decodeToken._id)
        if (!user)
        {
            throw new ApiError(400,"Unauthorized access");
        }
        req.user=user;
        return next();

    }
    catch(error)
    {
        throw new ApiError(400,error || "Invalid Access Token");

    }
})
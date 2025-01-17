import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudniary.js"
import {ApiError} from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
    }
    

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )
const GenerateAccessAndRefreshToken=async(userId)=>
{
    try{
        const user=await User.findById(userId)
        const accessToken = user.GenerateAccessToken
        const refreshToken = user.GenerateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return(accessToken, refreshToken)

    }catch(error)
    {
        throw new ApiError(500, "Something went wrong while Generating refresh and access token")
    }
}
const loginUser=asyncHandler(async(req,res)=>
{
    //To Do
    //req.body 
    //validate username,email
    //find the user
    //password check 
    //generate access and refresh token 
    //send the cookies  response back to the user
    //send cookie

    const {email,username,password}=req.body;

    if (!(username || email))
    {
        throw new ApiError(400,"username or email is required")
    }
    const user = await User.findOne(
        {
        $or:[{username},{email}]
        }
    )
    if(!user)
    {
        throw new ApiError(404,"User Does not exist ")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid)
    {
        throw new ApiError(401,"Invalid user creditnals")
    }
    const {accessToken,refreshToken}=await GenerateAccessAndRefreshToken(user._id)
    const loggedInUser = User.findById(user._id).select("-password,-refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in successfully"
        )
    )

})
const logoutUser=asyncHandler(async(req, res)=>
{
    await User.findByIdAndDelete(
        req.user._id,
        {
            $set:
            {
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options=
    {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",accessToken)
    .clearCookie("refreshToken",refreshToken)
    .json( new ApiResponse(200,"USer Logout successfully"))


})

const refreshToken=asyncHandler(async(req,res)=>
{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorized request")
    }
   try {
     const decodeToken =jwt.verify(incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
     const user = await User.findById(decodeToken?._id)
     if (!user) {
         throw new ApiError(401,"Invalid refresh token")
     }
     if (!incomingRefreshToken !== user?.refreshToken)
     {
         throw new ApiError(401,"Refresh token is expirted or used")
     }
 
     const options =
     {
         httpOnly:true,
         secure:true,
     }
     const {accessToken,newrefreshToken} =  await GenerateAccessAndRefreshToken(user._id)
 
     return res
     .status(200)
     .cookie ("accessToken",accessToken,options)
     .cookie("refreshToken",newrefreshToken,options)
     .json(
         new ApiResponse
         (200,{accessToken,newrefreshToken,},
             "Access Token refreshed"
         ))
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid Refresh Token" )
   }
})

const changeCurrentPassword=asyncHandler(async(req,res) => {
    const {oldpassword,newpassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldpassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newpassword
    await user.save({validateBeforeSave:false})
    return res.
    status(200)
    .json(new ApiResponse(200,{},"Password Changed Successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullName,email} = req.body

        if(!fullName || !email) {
            throw new ApiError(400,"Please fill in all fields")
        }
        const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:
            {
                fullName,
                email,
            }
        },
        {new:true})
        .select("-password")
    return res.status(200).json(new ApiResponse(200,user,"Account details update Successfully"))
})
const getCurrentUser=asyncHandler(async(req,res)=>
{
    return res
    .status(200)
    .json(200,req.user,"Current User Fetched successfully")
})
const updateUserAvatar =asyncHandler(async(req,res)=>
{
    const avatarLocalPath= req.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url) {
        throw new ApiError(400,"Error while uploading avatar")
    }

    await User.findByIdAndUpdate(req.user?._id, {
        $set:
        {
            avatar:avatar.url
        }
    },
        {new:true}
    ).select("-password")
})
const updateUserCoverImage =asyncHandler(async(req,res)=>
    {
        const coverImageLocalPath= req.file?.path
    
        if(!coverImageLocalPath) {
            throw new ApiError(400,"coverImage is missing")
        }
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
        if(!coverImage.url) {
            throw new ApiError(400,"Error while uploading avatar")
        }
    
        await User.findByIdAndUpdate(req.user?._id, {
            $set:
            {
                coverImage:coverImage.url
            }
        },
            {new:true}
        ).select("-password")

        return res.
        status(200).json(
            new ApiResponse(200,user,"coverImageUpdate")
        )
    })

const getUserChannelProfile=asyncHandler(async(req,res)=>
{
    const {username} = req.params
    if(!username?.trim()) {
        throw new ApiError(400,"Invalid UserName")
    }
    const channel = await User.aggregate([
        {
            $match:
            {
                username: username?.toLowerCase()
            },
            $lookup:
            {
                from:"subscritpions",
                localField:"_id",
                foreignField:"channel",
                as:"subsriber"
            }, 
        },
        {
            $lookup:
            {
                fron:"subscritpion",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribesTo"
            }
        },
        {
            $addFields:
            {
                subscribesCount:
                {
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:
                {
                    $size:"$subscribesTo"
                },
                isSubsribed:
                {
                    $cond:
                    {
                        if:
                        {
                            $in:[req.user?._id,"$subscribers.subscriber"]
                        }
                    }
                }
            }
        },
        {
            $project:
            {
                fullName:1,
                username:1,
                subscribesCount:1,
                channelsSubscribedToCount:1,
                isSubsribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])
    if(!channel?.length)
    {
        throw new Error(400,"Channel does not exist")
    }

    return res.
    status(200)
    .json(
        new ApiResponse(200,channel[0],)
    )
})

const getWatchHistory=asyncHandler(async(req,res)=>
{
   // req.user._id //String to mongoose 
   const user = await User.aggregate([
    {
        $match:{
        _id:new mongoose.Types.ObjectId(req.user._id),
        }
    },
    {
        $lookup:
        {
            from:"videos",
            localField:"getWatchHistroy",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
                {
                    $lookup:
                    {
                        from:"User",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline: [
                            {
                                $project:
                                {
                                    fullName:1,
                                    avatar:1,
                                    username:1,

                                }
                            }
                        ]
                    }
                },
                {
                    $addFields:
                    {
                        owner:
                        {
                            $first:"$owner"
                        }
                    }
                }
            ]
        }
    }
   ])
   return res.status(200).json(
    new ApiResponse(200,user[0].watchHistroy,
        "Watch history fetched successfully"
    )
   )
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateAccountDetails,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};



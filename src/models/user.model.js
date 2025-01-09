import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const UserSchema = new Schema(
{
    username:
    {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        index:true
    },
    email:
    {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true
    },
    fullname:
    {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index:true
    },
    avatar:
    {
        type: String, // cloudinary url
        required:true
    },
    coverImage:
    {
        type:String , // cloudinary
    },
    watchHistory:
    [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Video'
    }],
    password:
    {
        type:String,
        required:[true,'password is required'],

    },
    refreshToken:
    {
        type:String,
    }


}
,{timestamps:true});

UserSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next;
    this.password= await bcrypt.hash(this.password,16);
    next();
})

UserSchema.methods.isPasswordCorrect= async function(password){
    
    return await bcrypt.compare(password,this.password)

}

UserSchema.methods.GenerateAccessToken= function() {
    jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullname,

    },process.env.ACCESS_TOKEN_SECRET,
{
    expires:process.env.ACCESS_TOKEN_EXPIRY,
})
}
UserSchema.methods.GenerateRefreshToken= function() {
    jwt.sign({
        _id:this._id,

    },process.env.REFRESH_TOKEN_SECRET,
{
    expires:process.env.REFRESH_TOKEN_EXPIRY,
})
}

export const User = mongoose.model("User", UserSchema);


import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"
const connectDB= async()=>
{
    try
    {
        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n Mongodb connected !! DB Host ${connectInstance.connection.host}`);

    }
    catch(err)
    {
        console.log(err)
    }
}
export default connectDB;
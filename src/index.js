import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import {app} from "./app.js";
dotenv.config({
    path: "./.env",
}
)
connectDB()
.then(()=>
{
    app.listen(process.env.PORT || 8000,()=>
    {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch(err => console.error(
    err
))
/*
// IFFE
;(async()=>
{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

    }
    catch(e){
        console.log('Error',e);
    }

}) ()
    */
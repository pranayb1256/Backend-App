import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
    })

    const uploadOnCloudinary=async(localFilePath) =>
    {
        try
        {
            if(!localFilePath) return null;
            //upload the file to cloudinary
            const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type: "auto",
            })
            //File has been uploaded succesfull
            console.log("File is uploade don cloudinary",response.url);
        }
        catch(error)
        {
            fs.unlinkSync(localFilePath); // remove the local saved temporirly file as the upoad operation got failed
            return null;


        }
    }
export {uploadOnCloudinary};
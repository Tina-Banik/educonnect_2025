import { v2 as cloudinary } from "cloudinary";
import { config } from "../types/type";
import { asyncHandler } from "./asyncHandler";
//  (async function() {
    // here I declare the configuration
    cloudinary.config({
        cloud_name: config.cloudinaryCloudName,
        api_key: config.cloudinaryApiKey,
        api_secret: config.cloudinaryApiSecret
    })
//  })()
 export const uploadCloudinary =(async(localFilePath:any)=>{
    if(!localFilePath) return null
    //upload the file on cloudinary
    try {
        const response = await cloudinary.uploader.upload(
            localFilePath,{resource_type:"auto"});
            console.log("The response url is :"+response);
            console.log("the uploaded file url is :", response.secure_url);
            return response;
    } catch (error) {
        console.error("Cloudinary uploaded url is :", error);
        return null;
    }
 })
;
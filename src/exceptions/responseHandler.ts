import { Response } from "express";
/**here I write the code for the success code */
export const successResponse = (res:Response,message:string,data:any={},statusCode:number=200)=>{
    return res.status(statusCode).json({
        success:true,
        message,
        data,
    })
}
/**here I write the code for the error code */
export const errorResponse = (res:Response,message:string,data:any={},statusCode:number=500)=>{
    return res.status(statusCode).json({
        success:false,
        message,
        data
    })
}
/**here I write the code for the unauthorized access */
export const unauthorizedResponse = (res:Response,message:String,data:any={},statusCode:number=401)=>{
    return res.status(statusCode).json({
        success:false,
        message,
        data
    })
}
/**for the invalid token */
export const invalidToken = (res:Response,message:String,data:any={},statusCode:number=400)=>{
    return res.status(statusCode).json({
        success:false,
        message,
        data
    })
}
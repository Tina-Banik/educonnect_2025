import jwt from "jsonwebtoken";
import { config } from "../../types/type";
import { Response,Request,NextFunction } from "express";
import { errorResponse, unauthorizedResponse } from "../exceptions/responseHandler";
import { asyncHandler } from "../../utils/asyncHandler";
import { error } from "console";
/**
 * Here, I write the code for the verifying the refresh token as I want to create an access token.
 * ACCESS_TOKEN = life span is very short, 
 * REFRESH_TOKEN = Issued at the authorization, client users to request new access token verified with end point and database, must be allowed to expire or logout, will allow refresh tokens to be terminated early if the user decided to logout and again refresh tokens need to be allowed to expire, so indefinite access can not be gained.
 * 
 */
export const verifyRefreshToken = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    console.log("The req.headers:", req.headers);
    console.log("the req.cookies:", req.cookies);
    let refresh_key = config.refreshKey;
    console.log(`The refresh key is : ${refresh_key}`);
    /**if the refresh key is present then wee pass that refresh token int the headers */
    if(refresh_key){
        const refresh_token = req.headers._refreshtoken || req.cookies.refreshToken;
        console.log(`The refresh token that comes from the header is : ${refresh_token}`);
        if(!refresh_token){
            return errorResponse(res,"The auth header is missing");
        }
        /**after passing the refresh token we decode the token */
        const decodedToken = jwt.verify(refresh_token,refresh_key);
        console.log(`The decoded token is ${decodedToken}`);
        /**after decoding the token we attach it to the req.decode */
        req.decode = decodedToken;
        console.log(`The req.decode token is: ${(req as any).decode}`);
        next();
    }
    if(error.name === "TokenExpiredError"){
        return unauthorizedResponse(res,"JWT Expired");
    }
});

/**here I write the code verify the access token */
export const verifyAccessToken = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    console.log("The req.headers for the access token:", req.headers);
    console.log("the req.cookies for the access token:", req.cookies);
    let access_key = config.accessKey;
    console.log("The access key is :", access_key);
    /**if the access key is present then we pass the access token in the headers */
    if(access_key){
        const access_token = req.headers._accesstoken || req.cookies.accessToken;
        console.log("The access token that comes form the headers:", access_token);
        if(!access_token){
            return errorResponse(res,"The auth header is missing");
        }
        const decodedToken = jwt.verify(access_token,access_key);
        console.log('The decoded token is for the access token :', decodedToken);
        req.decode = decodedToken;
        console.log("The req.decode token is for the access token: " , req.decode);
        next();
    }
})
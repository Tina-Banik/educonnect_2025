import { NextFunction,Request,Response } from "express";
import { asyncHandler } from "./asyncHandler";
import { TokenPayload } from "../types/express";
import { unauthorizedResponse } from "../src/exceptions/responseHandler";

export const isAdmin = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    const {role} = req.decode as TokenPayload;
    console.log('the role is:', role);
    if(role !== "admin"){
        return unauthorizedResponse(res,"Only admin can upload the KYC");
    }
    next();
})
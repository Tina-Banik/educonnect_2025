import { NextFunction, Request,Response,} from "express";
import { validationResult } from "express-validator";
import { errorResponse } from "../exceptions/responseHandler";

export const handleValidationErrors = async(req:Request,res:Response,next:NextFunction)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return errorResponse(res,"Validation Failed",errors.array());
    }
    next();
}
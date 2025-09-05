import { Request,Response,NextFunction } from "express";
function asyncHandler(requestHandler:any){
    return function(req:Request,res:Response,next:NextFunction){
        Promise.resolve(requestHandler(req,res,next))
        .catch(function (err){
            next(err);
        })
    }
}
export {asyncHandler}
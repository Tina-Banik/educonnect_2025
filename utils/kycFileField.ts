import { InstituteType } from "@prisma/client";
import  multer from "multer";
import { Request,Response,NextFunction } from "express";
import { kycUpload } from "../file/fileUpload";
import { errorResponse } from "../src/exceptions/responseHandler";
import { prismaClient } from "../db/db.connection";
import { TokenPayload } from "../types/express";
/**here, I want to generate the dynamically the fields based on institute types , here I export the functions*/
export function getKycFields(type:InstituteType):multer.Field[]{
   if(type == 'individual_tutor'){
      return [ 
         {name:"tutorGovtId",maxCount:1},
         {name:"educationalCertificate",maxCount:1},
         {name:"tutorPhoto",maxCount:1},
         {name:"addressProof",maxCount:1}
      ]
   }else{
      return[
         {name:"instituteRegCertificate",maxCount:1},
         {name:"gstCertificate",maxCount:1},
         {name:"adminGovtId",maxCount:1},
         {name:"adminGovtPhoto",maxCount:1},
         {name:"establishmentProof",maxCount:1}
      ]
   }
}
/**here I want to write this ow here I write this condition that to ensure that the logged-in user can only upload KYC documents for the instituteType they are assigned to. If they pass a mismatched instituteType in the query, reject the request. */
export const checkInstituteType = async(req:Request,res:Response,next:NextFunction)=>{
   const {uid} = req.decode as TokenPayload;
   console.log('the user id for checking the institute type is:',uid);
   const {instituteType} = req.query;
   console.log('The institute_type that comes from the query:', instituteType);
   const user= await prismaClient.user.findUnique({
      where:{uid},
      select:{instituteType:true}
   });
   console.log('The user institute type they are assigned to:', user?.instituteType);
   if(user?.instituteType !== instituteType){
         return errorResponse(res,`You are not authorized to upload KYC for '${instituteType}'. Your assigned institute type is '${user?.instituteType}'.`)
   }
   req.query.instituteType = user?.instituteType;
   next();
}
/***here I create a dynamic custom multi middleware that reads req.query.institute types*/
export const dynamicUpload = async(req:Request,res:Response,next:NextFunction)=>{
   const type = req.query.instituteType as InstituteType;
   console.log("The institute type is:",type);
   if(!type){
      return errorResponse(res,"The institute type is missing");
   }
   console.log("Expected fields are:", getKycFields(type));
   const upload = kycUpload.fields(getKycFields(type));
   upload(req,res,(error:any)=>{
      if(error){
         return errorResponse(res,error.message);
      }
      next();
   })
}

/***
 * export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.decode as TokenPayload;
    if (!allowedRoles.includes(role)) {
      return errorResponse(res, `Access denied for role: ${role}`);
    }
    next();
  };
};

// Usage:
authRoute.post('/kyc/upload', verifyAccessToken, requireRole(["admin"]), checkInstituteType, dynamicUpload, updateKycDetails);
 */
// export const allKycFields:multer.Field[] =[
//    {name:"instituteRegCertificate",maxCount:1},
//    {name:"gstCertificate",maxCount:1},
//    {name:"adminGovtId",maxCount:1},
//    {name:"adminGovtPhoto",maxCount:1},
//    {name:"establishmentProof",maxCount:1},
//    { name: "tutorGovtId", maxCount:1},
//    {name: "educationalCertificate",maxCount:1},
//    {name:"tutorPhoto",maxCount:1},
//    {name:"addressProof",maxCount:1}
// ];
// export const kycUploadAll = kycUpload.fields(allKycFields);
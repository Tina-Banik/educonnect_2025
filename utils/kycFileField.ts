import { InstituteType } from "@prisma/client";
import  multer from "multer";
import { Request,Response,NextFunction } from "express";
import { kycUpload } from "../file/fileUpload";
import { errorResponse } from "../src/exceptions/responseHandler";
/**here, I want to generate the dynamically the fields based on institute types , here I export the functions*/
// export function getKycFields (type:InstituteType):multer.Field[]{
//    if(type === 'individual_tutor'){
//       return[
//           { name: "tutorGovtId", maxCount:1},
//           {name: "educationalCertificate",maxCount:1},
//           {name:"tutorPhoto",maxCount:1},
//           {name:"addressProof",maxCount:1}
//       ]
//    }
//    return[
//          {name:"instituteRegCertificate",maxCount:1},
//          {name:"gstCertificate",maxCount:1},
//          {name:"adminGovtId",maxCount:1},
//          {name:"adminGovtPhoto",maxCount:1},
//          {name:"establishmentProof",maxCount:1}
//    ]
// }

export const allKycFields:multer.Field[] =[
   {name:"instituteRegCertificate",maxCount:1},
   {name:"gstCertificate",maxCount:1},
   {name:"adminGovtId",maxCount:1},
   {name:"adminGovtPhoto",maxCount:1},
   {name:"establishmentProof",maxCount:1},
   { name: "tutorGovtId", maxCount:1},
   {name: "educationalCertificate",maxCount:1},
   {name:"tutorPhoto",maxCount:1},
   {name:"addressProof",maxCount:1}
];
export const kycUploadAll = kycUpload.fields(allKycFields);
// export const timeParser = multer().any();
/***here I create a dynamic custom multi middleware that reads req.body.institute types*/
// export const dynamicKycUpload = async(req:Request,res:Response,next:NextFunction)=>{
//    // const type = req.query.instituteType as InstituteType;
//    const type = req.body.instituteType as InstituteType;
//    console.log('The type of the institute is :', type);
//    if(!type){
//       return errorResponse(res,"Missing instituteType in form data");
//    }
//       const upload = kycUpload.fields(getKycFields(type));
//       console.log("The upload details are :", upload);
//       upload(req,res,(error:any)=>{
//             if(error){
//                return errorResponse(res, error.message)
//             }
//             next();
//       })
// };
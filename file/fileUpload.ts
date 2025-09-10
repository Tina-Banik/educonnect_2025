import multer from "multer";
import path from "path";
import fs from "fs";
import { TokenPayload } from "../types/express";
import { InstituteType } from "@prisma/client";
/***
 * There are two options available, destination and filename. They are both functions that determine where the file should be stored.destination is used to determine within which folder the uploaded files should be stored. This can also be given as a string (e.g. '/uploads/kyc'). If no destination is given, the operating system's default directory for temporary files is used.
 */
const fileStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        const instituteType = typeof req.query.instituteType === 'string' ? req.query.instituteType : "unknown";
        // const instituteType = req.body.instituteType;
        const userId = (req.decode as TokenPayload)?.uid || 'anonymous';
        /**here we check for specific the institute type */
        const folderPath = path.join(
            __dirname,
            "..",
            "public",
            "uploads",
            "kyc",
            instituteType,
            userId
        );
        fs.mkdirSync(folderPath,{recursive:true})
        cb(null,folderPath);
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'-'+ file.originalname);
    }
});
export const kycUpload = multer({
    limits:{
        fileSize:  5 * 1024 * 1024 ,
    },
    fileFilter:(req,file,cb)=>{
        const allowedTypes = ["image/png","image/jpg","image/jpeg","application/pdf"];
        if(allowedTypes.includes(file.mimetype)){
            cb(null,true);
        }else{
           cb((new Error as any)("Only jpeg, jpg, png images are allowed"), false);
        // cb(null,false);
        }
    },
    storage:fileStorage
})
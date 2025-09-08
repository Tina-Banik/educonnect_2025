import multer from "multer";
const fileStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'uploads/kyc');
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'-'+ file.originalname);
    }
});

export const kycUpload = multer({
    limits:{
        fileSize: 50000,
    },
    fileFilter:(req,file,cb)=>{
        const allowedTypes = ["image/png","image/jpg","image/jpeg"];
        if(allowedTypes.includes(file.mimetype)){
            cb(null,true);
        }else{
        //    cb((new Error as any)("Only jpeg, jpg, png images are allowed"), false);
        cb(null,false);
        }
    },
    storage:fileStorage
})
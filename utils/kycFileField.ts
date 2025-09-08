import  multer from "multer";

export const kycFileFields: multer.Field[]= [
   { name: "instituteRegCertificate", maxCount:1},
   { name: "gstCertificate", maxCount:1},
   { name: "adminGovtId", maxCount:1},
   {name:"establishmentProof",maxCount:1},
   { name: "tutorGovtId", maxCount:1},
   {name:"educationalCertificate",maxCount:1},
   {name:"tutorPhoto",maxCount:1},
   {name:"addressProof",maxCount:1},
]
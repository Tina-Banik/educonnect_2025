import { NextFunction, Request,Response } from "express"
import crypto from "crypto"
import { errorResponse, invalidToken, successResponse, unauthorizedResponse } from "../exceptions/responseHandler"
import {hashSync,compareSync} from "bcrypt"
import { prismaClient } from "../../db/db.connection";
import { asyncHandler } from "../../utils/asyncHandler";
import { create_accessToken, create_refreshToken } from "../middlewares/jwt.middleware";
import { initiateOtp } from "../../services/otp.service";
import { config } from "../../types/type";
import { sendNotificationEmail, sendVerificationEmail } from "../../utils/mailer";
import { TokenPayload } from "../../types/express";
import { uploadCloudinary } from "../../utils/cloudinary";
import { promises as fs} from "fs";
import { calculateProfileCompletion, getNextSteps } from "../../utils/profileCompletion";
/**here I write the code for the new admin */
export const register = asyncHandler(async(req:Request,res:Response)=>{
    try {
        const {instituteName,instituteType,fullName,email,phoneNumber,instituteAddress,city,state,postalCode,password,confirmPassword,role,acceptedTerms,acceptedPrivacy} = req.body;
        console.log(`instituteName : ${instituteName},instituteType:${instituteType},fullName:${fullName},email:${email},phoneNumber:${phoneNumber},instituteAddress:${instituteAddress},city:${city},state:${state},postalCode:${postalCode},password:${password},confirmPassword:${confirmPassword},role:${role},acceptedTerms:${acceptedTerms},acceptedPrivacy:${acceptedPrivacy}`);
        /**if the user email is already exists*/
        const userExists = await prismaClient.user.findFirst({
            where:{email:email}
        })
        console.log("This email is already exists:", userExists);
        if(userExists){
            return unauthorizedResponse(res,"User is already exists")
        }
        /**if the phone number is already exists */
        const phoneExists = await prismaClient.user.findFirst({
            where:{phoneNumber:phoneNumber}
        });
        console.log("The phone number is already exists:", phoneExists);
        if(phoneExists){
            return unauthorizedResponse(res,"Phone number is already exists");
        }
        /***here I write the code for the hash passwords */
        const hashPassword =  hashSync(password,10);
        /**if the password and confirm password does not match then it throws the error */
        if (password !== confirmPassword) {
                return errorResponse(res, "Password and Confirm Password do not match");
        }
        /**here I create an email token */
        const emailToken = crypto.randomBytes(32).toString('hex');
        console.log(`The email toke is: ${emailToken}`);
        /**verification expiry email token */
        const verificationExpiry = new Date(Date.now() + 60 * 60 * 1000)
        /**if the admin is new then it creates a new account */
        const newUser = await prismaClient.user.create({
            data:{
                instituteName,
                instituteType,
                fullName,
                email,
                phoneNumber,
                instituteAddress,
                city,
                state,
                postalCode,
                password:hashPassword,
                role: "admin", // Role Access Based C
                acceptedTerms: acceptedTerms === true || acceptedTerms === "true",
                acceptedPrivacy: acceptedPrivacy ==true || acceptedPrivacy === "true",
                emailToken,
                emailVerified:false,
                verificationExpiry,
            }
        });
        console.log("The new user is :", newUser);
        await sendVerificationEmail(newUser.email,emailToken);
        console.log(`Verify email: ${config.baseUrl}${config.apiUrl}/admin/verify-email?token=${emailToken}`);
        if(newUser){
            return successResponse(res,"Admin is registered successfully",{uid: newUser.uid,email: newUser.email,role: newUser.role})
        }else{
            return errorResponse(res,"Data validation is wrong");
        }
    } catch (error:any) {
        return errorResponse(res,"Internal server error",error.message || error); 
    }
})
/**here I write code for the login */
export const login = asyncHandler(async(req:Request,res:Response)=>{
    const {fullName,email,password} = req.body;
    console.log(`The fullname is : ${fullName}, email:${email}, ${password}`);
    /**check the username or email */
    if(!(fullName || email)){
        return unauthorizedResponse(res,"Username or Fullname or email is required")
    }
    /**if the user is valid */
    const validUser = await prismaClient.user.findFirst({
        where:{
            OR:[{fullName:fullName},{email:email}]
        }
    });
    console.log("The valid user information is :", validUser);
    if(!validUser){
        return unauthorizedResponse(res,"User not found");
    }
    /**if the user is valid then we compare the password */
    console.log("The user who is valid the password is :", validUser?.password);
    const isPasswordCorrect = compareSync(password,validUser.password);
    console.log("The password is valid for the user:", isPasswordCorrect);
    if(!isPasswordCorrect){
        return unauthorizedResponse(res,"Invalid user credentials");
    }
    /**after comparing the password and checking the valid user here we display the logged user id */
    const loggedUser:any = await prismaClient.user.findFirst({
        where:{uid:validUser.uid},
        select:{uid:true,fullName:true,email:true,role:true}
    });
    console.log("The logged user is :", loggedUser)
    /**now for the logged user we display the code for the refresh and access token */
    const accessToken = await create_accessToken(loggedUser?.uid,loggedUser?.email,loggedUser?.role);
    console.log(`The access token is : ${accessToken}`);
    const refreshToken = await create_refreshToken(loggedUser.id,loggedUser.email);
    console.log(`The refresh token is : ${refreshToken}`);
    /**save refresh token in the database */
    await prismaClient.user.update({
        where:{uid:loggedUser.uid},
        data:{refreshToken}
    })
    /**here I write the code for the cookies for the access token */
    const options = {
        httpOnly:true,
        secure:true,maxAge:20*1000
    };
    res.cookie("accessToken", accessToken, options);
    res.cookie("refreshToken", refreshToken, {httpOnly: true,secure: true,maxAge: 2 * 60 * 1000});
    return successResponse(res,`${loggedUser.fullName} is logged in successfully`,{email:loggedUser.email,_accessToken:accessToken,_refreshToken:refreshToken});
})
/**here is the code for the verify email */
export const verifyEmail = asyncHandler(async(req:Request,res:Response)=>{
    const {token} = req.query;
    console.log("The token for the verify email:", token);
    if(!token || typeof token !== "string"){
        return invalidToken(res,"Invalid Token")
    }
    /**for finding the email token according to the user */
    const user = await prismaClient.user.findFirst({
        where:{emailToken:token}
    });
    console.log("The user for the token is :", user);
    if(!user){
        return invalidToken(res,"Invalid Token");
    }
    if(user.emailVerified){
        return successResponse(res,"Email Already Verified");
    }
    if(user.verificationExpiry && user.verificationExpiry < new Date()){
        return invalidToken(res,"Token Expired. Please request a new one");
    }
    // success → verify // nodemailer email send --> romabanik3@gmail.com mailtrack, send=t
    await prismaClient.user.update({
        where:{uid:user.uid},
        data:{
            emailVerified: true,
            emailToken:null,
            verificationExpiry:null
        }
    })
    return successResponse(res,"Email Verified Successfully.")
})
/**verify the verifyPhone 
 * Must check if user exists, OTP is valid, not expired, and phone isn't already verified * 
 */
// export const verifyPhone = asyncHandler(async(req:Request,res:Response)=>{
//     const {phoneNumber,otp} = req.body;
//     console.log(`The phone number is : ${phoneNumber}`);
//     if(!phoneNumber){
//         return errorResponse(res,"Phone number is not correct.")
//     }
//     /** if the user is found */
//     const user = await prismaClient.user.findUnique({
//         where:{phoneNumber}
//     })
//     if(!user){
//         return errorResponse(res,"User not found");
//     }
//     if(user.phoneVerified){
//         return successResponse(res,"Phone Already Verified");
//     }
//     /** if the otp expired */
//     if(!user.otpCode || !user.otpExpiry || user.otpExpiry < new Date()){
//         return errorResponse(res,"OTP EXPIRED !!")
//     }
//     /**IF THE ATTEMPTS IS MORE THAN 3 */
//     if(user.otpAttempts >=3){
//         return errorResponse(res,"Too many failed attempts");
//     }
//     // Ques :  resend otp 
//     /** check the otp code  */
//     if(user.otpCode !== otp){
//         await prismaClient.user.update({
//             where:{phoneNumber},
//             data:{
//                 phoneVerified: true,
//                 otpCode: null,
//                 otpExpiry:null,
//                 otpAttempts: 0,
//             }
//         });
//     }
//     return successResponse(res,"Phone verified successfully");
// })
export const verifyPhone = asyncHandler(async(req:Request,res:Response)=>{
    const{phoneNumber,otp} = req.body;
    console.log(`The phone number is ${phoneNumber} and the otp: ${otp}`);
    if(!phoneNumber){
        return errorResponse(res,"Phone number is not correct");
    }
    /**here we write the function for finding the user with their phone number */
    const user = await prismaClient.user.findUnique({
        where:{phoneNumber}
    });
    console.log(`The user with their phone number: ${JSON.stringify(user?.phoneNumber)}`);
    if(!user){
        return unauthorizedResponse(res,"User not found.");
    }
    /**if the phone is already verified, exists early */
    if(user?.phoneVerified){
        return unauthorizedResponse(res,"Phone is already verified");
    };
    /** if the otp is already expired or not */
    if(!user.otpExpiry || !user.otpCode || user.otpExpiry < new Date()){
        return errorResponse(res,"OTP has expired");
    }
    /**if the otp has two many attempts */
    if(user.otpAttempts >= 3){
        return errorResponse(res,"Too many failed attempts");
    }
    /**if the user enters the otp and the otp code is not same then it executes this functions */
    if(user.otpCode !== otp){
        await prismaClient.user.update({
            where:{phoneNumber},
            data:{
                otpAttempts: user.otpAttempts + 1
            }
        });
        return errorResponse(res,"INVALID OTP");
    }
    /**if the otp is correct */
    await prismaClient.user.update({
        where:{phoneNumber},
        data:{
            phoneVerified:true,
            otpCode:null,
            otpExpiry:null,
            otpAttempts:0
        }
    });
    return successResponse(res,"Phone number is verified successfully..");
})
/**send the otp to phone 
 * Must check if user exists and phone is already verified before sending OTP
 * */ 
export const sendOtpPhone = asyncHandler(async(req:Request,res:Response)=>{
    const {phoneNumber} = req.body;
    console.log(`The phone number is : ${phoneNumber}`);
    if(!phoneNumber){
        return errorResponse(res,"Phone number is required");
    }
    /**now I find out the user's phone number */
    const user = await prismaClient.user.findUnique({
        where:{phoneNumber}
    });
    console.log(`The user details in which we send the otp: ${user}`)
    if(!user){
        return unauthorizedResponse(res,"User is not found");
    }
    /**If phone is verified successfully, there is no need to send the otp */
    if(user.phoneVerified){
        return  successResponse(res,"Phone verified successfully");
    }
    /**if the phone number is verified successfully then we initialize the otp, for that I write the separate functions in services/otp.service.ts*/
    await initiateOtp(phoneNumber); // generate the otp here
    return successResponse(res,"OTP sent successfully");
})
/**here I am writing the functions about creating the access token using the refresh token */
export const refreshAccessToken = asyncHandler(async(req:Request,res:Response)=>{
    console.log("The req.decode is :", req.decode);
    /**here I display the login info of the user */
    const loginInfo:any = await prismaClient.user.findUnique({
        where:{email:(req.decode as TokenPayload).email}
    });
    console.log("The login info is true when the access token needs to created:" ,loginInfo);
    return successResponse(res,"The access token is refreshed",{_newAccessToken:await create_accessToken(loginInfo?.uid,loginInfo?.email,loginInfo?.role)});
})
/**here I am write the functions about the create  notifications */
export const createNotifications = asyncHandler(async(req:Request,res:Response)=>{
    const {uid:tokenUserId , role:tokenUserRole} = (req.decode as TokenPayload) || undefined;
    const {userId,type,title,message} = req.body;
    console.log(`The user id is : ${userId}, the type is:${type} ,the title is:${title}, the message is:${message}`);

    /**body userId matches the tokenUserId */
    if(userId !== tokenUserId && tokenUserRole !== "admin"){
        return unauthorizedResponse(res,"Unauthorized user to create the notifications");
    }
    /**create notification function */
    const newNotification = await prismaClient.notification.create({
        data:{
            userId, type, title, message
        }
    });
    console.log("The new notifications are:", newNotification);
    /**fetch user email */
    const fetchUserEmail = await prismaClient.user.findUnique({
        where:{uid:userId}
    });
    console.log(`The fetch user email is: ${fetchUserEmail?.email}`);
    //here I send the sendNotifications Email
    if(fetchUserEmail?.email){
        await sendNotificationEmail(
            fetchUserEmail.email,
            `${title}`,
            message
        )
    }
        return successResponse(res,"Notifications created successfully",{data:newNotification})
})
/** here I write the code for the update the kyc details for the admin according to the institute type. KYC can be files,pdf,images*/
export const updateKycDetails = asyncHandler(async(req:Request,res:Response)=>{ 
    // return successResponse(res,"The kyc is uploaded..");
     /**now here I write this condition that to ensure that the logged-in user can only upload KYC documents for the instituteType they are assigned to. If they pass a mismatched instituteType in the query, reject the request.
//  */
   const {uid} = req.decode as TokenPayload;
   console.log("The user id is :", uid);
   const {instituteType} = req.query;
   console.log("The institute type is:", instituteType);
    if(!instituteType){
        return errorResponse(res,"Institute type is missing");
    }
//    const user = await prismaClient.user.findUnique({where:{uid}});
//    console.log('The user institute type they are assigned to:', user?.instituteType);
//     if(user?.instituteType !== instituteType){
//             return errorResponse(res, `You are not authorized to upload KYC for '${instituteType}'. Your assigned institute type is '${user?.instituteType}'.`)
//     }
//     /**here I take the file object */
    const files:any = req.files as Record<string,Express.Multer.File[]>;
    /**here I am taking the kyc data */
    const kycData:any = {
        userId:uid,instituteType,
        instituteRegCertificate : files?.instituteRegCertificate?.[0].path || "",
        gstCertificate: files?.gstCertificate?.[0].path || "",
        adminGovtId: files?.adminGovtId?.[0].path ||"",
        adminGovtPhoto: files?.adminGovtPhoto?.[0].path || "",
        establishmentProof: files?.establishmentProof?.[0].path ||  "",
        tutorGovtId: files?.tutorGovtId?.[0].path || "",
        educationalCertificate: files?.educationalCertificate?.[0].path || "",
        tutorPhoto: files?.tutorPhoto?.[0].path || "",
        addressProof: files?.addressProof?.[0].path || ""
    };
    // const kycData:Record<string, string>={
    //     userId:uid, 
    //     instituteType: instituteType as string
    // }
    // console.log("The kyc data is ", JSON.stringify(kycData));
    // if(files && typeof files === 'object')
    // {
        // Object.keys(files).forEach((key)=>{
        //     kycData[key] = files[key][0]?.path;
        //  });
        for(const key of Object.keys(files)){
            const filePath = files[key][0]?.path;
            if(filePath){
                const uploaded = await uploadCloudinary(filePath);
                if(uploaded?.url){
                        kycData[key] = uploaded?.url;
                        await fs.unlink(filePath);
                }
                
            }
        }
        
    // }
    const savedKyc =  await prismaClient.kyc.upsert({
        where:{userId:uid},  
        update:kycData,
        create:kycData
    });
    console.log("The saved kyc details are:", JSON.stringify(savedKyc)); 
    return successResponse(res,"KYC Details are uploaded successfully");
}) 
/** here I write the function for displaying the profile*/
export const getProfile = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
    // return successResponse(res,"Profile has been fetched successfully.");
    const {uid} = req.decode as TokenPayload ; // here I fetch the user details from JWT token 
    console.log('The user id is:', uid); 
    /**after fetching the user id from the JWT token here I display the user profile and fetch the data from database*/
    const profile = await prismaClient.user.findUnique({
        where:{uid},
        select:{
            instituteName:true,
            instituteType:true,
            fullName:true,
            email:true,
            phoneNumber:true,
            instituteAddress:true,
            city:true,
            state:true,
            postalCode:true
        }
    });
    console.log('The user profile is :', profile);
    if(!profile){
        return errorResponse(res,"Profile is not fetched successfully.");
    }
    return successResponse(res,"Profile information is fetched successfully",profile);
})
/**here I write the code for update the user details and if KYC is rejected */
export const updateProfile = asyncHandler(async(req:Request,res:Response)=>{
    if(req.method === 'PUT' || req.method === 'PATCH'){
        const {uid} = req.decode as TokenPayload;
    console.log('The user id is:', uid);
    const {instituteName,instituteType,fullName,email,phoneNumber,instituteAddress,city,state,postalCode} = req.body;
    console.log(`The instituteName is :${instituteName}, instituteType is :${instituteType}, adminFullName is :${fullName}, email:${email},phoneNumber:${phoneNumber}, instituteAddress:${instituteAddress}, city:${city}, state:${state}, postalCode:${postalCode}`)
    /**fetch the user details */
    const user = await prismaClient.user.findUnique({where:{uid}});
    if(!user){
        return errorResponse(res,"User not found");
    }
    const requestedData:Record<string,any>= {
        fullName,email,phoneNumber,instituteAddress,city,state,postalCode
    };
    console.log('The updates are:', requestedData);
    if(user.kycStatus === "Rejected"){
        requestedData.instituteName = instituteName,
        requestedData.instituteType = instituteType,
        requestedData.email = email
    }
    /**find Only the changed fields */
    const updates:Record<string,any> = {};
    for(const key in requestedData){
            if(requestedData !== undefined && requestedData[key] !== user[key as keyof typeof user]){
                updates[key] = requestedData[key];
            }
    }
    /**nothing changed */
    if(Object.keys(updates).length ===0){
        return unauthorizedResponse(res,"Nothing Changes Detected here.")
    }
    const updated = await prismaClient.user.update({
        where:{uid},
        data:updates,
        select:{
                instituteName:true,
                instituteType:true,
                fullName:true,
                email:true,
                phoneNumber:true,
                instituteAddress:true,
                city:true,
                state:true,
                postalCode:true
        }
    });
    console.log('The update details are:', updated);
    return successResponse(res,"Profile updated is successfully",updated);
    }
    
})
/** here I write the functions for getting the dashboard */
export const getDashboard = asyncHandler(async(req:Request,res:Response)=>{
    const {uid} = req.decode as TokenPayload;
    console.log('The user dashboard is:', uid);
    /**here I display all the user details */
    const user = await prismaClient.user.findUnique({
        where:{uid},
        select:{
            kycStatus:true,
            fullName:true,
            phoneNumber:true,
            instituteAddress:true,
            city:true,
            state:true,
            postalCode:true,
            rejectionReason:true
        }
    });
    console.log('The user dashboard keys details are:', user);
    const profileCompletion = calculateProfileCompletion(user);
    console.log('The profile calculations are :', profileCompletion);
    /**here I write the code for the notifications api */
    const notifications = await prismaClient.notification.findMany({
        where:{userId:uid},
        orderBy:{createdAt:"desc"},
        take:5
    });
    console.log('The notifications are displayed from the api:', notifications);
    /**here I show the dashboard */
    const dashboard = {
        accountStatus: user?.kycStatus,
        profileCompletion,
        notifications,
        rejectionReason: user?.kycStatus === "Rejected" ? user.rejectionReason : null,
        nextSteps: getNextSteps(user?.kycStatus ?? "Pending")
    };
    console.log('The dashboards are :', dashboard);
    return successResponse(res,"Dashboard are loaded", dashboard);
})
/**here I write the functions for fetching all the notifications */
// export const getNotificationsUser = asyncHandler(async(req:Request,res:Response)=>{
//     const userId = req.params;
//     console.log('The user id is valid for fetching the user id :', userId);
//     /**fetch all the notifications */
//     const fetchNotification = await prismaClient.notification.findMany({
//         where:{userId},
//         orderBy: {createdAt: "desc"}
//     })
//     console.log(`The notifications are : ${fetchNotification}`);
//     return successResponse(res,"All the notifications are displayed");
// }) 
/**here I write the code for the notifications mark as read */
// export const markAsRead = asyncHandler(async(req:Request,res:Response)=>{
//     // return successResponse(res,"Notifications has been read");
//     const {notificationId} = req.body;
//     console.log('The notifications id for the mark as read :', notificationId);
//     /**here I write the functions as mark as updated */
//     const notificationMarkAsRead = await prismaClient.notification.update({
//         where:{id:notificationId},
//         data:{read:true}
//     });
//     console.log(`The notifications are marked as read: ${notificationMarkAsRead}`);
//     return successResponse(res,"The notifications are read",{data:notificationMarkAsRead});
// })

// return[
//           { name: "tutorGovtId", maxCount:1},
//           {name: "educationalCertificate",maxCount:1},
//           {name:"tutorPhoto",maxCount:1},
//           {name:"addressProof",maxCount:1}
//       ]
//    }else{
//         return[
//             {name:"instituteRegCertificate",maxCount:1},
//             {name:"gstCertificate",maxCount:1},
//             {name:"adminGovtId",maxCount:1},
//             {name:"adminGovtPhoto",maxCount:1},
//             {name:"establishmentProof",maxCount:1}
//         ]
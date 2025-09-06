import { Request,Response } from "express"
import crypto from "crypto"
import { errorResponse, invalidToken, successResponse, unauthorizedResponse } from "../exceptions/responseHandler"
import {hashSync,compareSync} from "bcrypt"
import { prismaClient } from "../../db/db.connection";
import { asyncHandler } from "../../utils/asyncHandler";
import { create_accessToken, create_refreshToken } from "../middlewares/jwt.middleware";
import { initiateOtp } from "../../services/otp.service";
import { config } from "../../types/type";
import { sendVerificationEmail } from "../../utils/mailer";
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
        console.log(`Verify email: ${config.baseUrl}/${config.apiUrl}/admin/verify-email?token=${emailToken}`);
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
        data:{refreshToken:refreshToken}
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
/**verify the profile */
export const verifyPhone = asyncHandler(async(req:Request,res:Response)=>{
    const {phoneNumber,otp} = req.body;
    console.log(`The phone number is : ${phoneNumber}`);
    if(!phoneNumber){
        return errorResponse(res,"Phone number is not correct.")
    }
    /** if the user is found */
    const user = await prismaClient.user.findUnique({
        where:{phoneNumber}
    })
    if(!user){
        return errorResponse(res,"User not found");
    }
    await initiateOtp(phoneNumber); // here I sent the otp.
    if(user.phoneVerified){
        return successResponse(res,"Phone Already Verified");
    }
    /** if the otp expired */
    if(!user.otpCode || !user.otpExpiry || user.otpExpiry < new Date()){
        return errorResponse(res,"OTP EXPIRED !!")
    }
    /**IF THE ATTEMPTS IS MORE THAN 3 */
    if(user.otpAttempts >=3){
        return errorResponse(res,"Too many failed attempts");
    }
    // Ques :  resend otp 
    /** check the otp code  */
    if(user.otpCode !== otp){
        await prismaClient.user.update({
            where:{phoneNumber},
            data:{
                phoneVerified: true,
                otpCode: null,
                otpExpiry:null,
                otpAttempts: 0,
            }
        });
    }
    return successResponse(res,"Phone verified successfully");
})
import { prismaClient } from "../db/db.connection";

function generateOtp():string{
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

export async function initiateOtp(phoneNumber:string){
    const otp = generateOtp();
    const expiry = new Date(Date.now() + 5 * 60 *1000);

    await prismaClient.user.update({
        where:{phoneNumber},
        data:{
            otpCode:otp,
            otpExpiry:expiry,
            otpAttempts:0
        }
    }); 
    await sendOtp(phoneNumber,otp);
}

export function sendOtp(phoneNumber:string,otp:string){
    console.log(`Sending OTP ${otp} to ${phoneNumber}`)
}
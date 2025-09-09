import "dotenv/config"
interface AppConfig{
    port : number | string;
    apiUrl: string;
    accessKey:string;
    accessKeyExpireTime:string;
    refreshKey:string;
    refreshKeyExpire:string;
    baseUrl:string,
    //SMTP DECLARE FOR NODE MAILER
    smtpHost:string;
    smtpPort:number | string;
    email_user:string;
    email_pass:string;
    email_from:string;
    // cloudinary settings
    cloudinaryCloudName:string;
    cloudinaryApiKey:string;
    cloudinaryApiSecret:string;
    cloudinaryUrl:string
}

export const config:AppConfig = {
    port: process.env.PORT || "",
    apiUrl: process.env.API_URL || "",
    accessKey: process.env.ACCESS_KEY  || "",
    accessKeyExpireTime: process.env.ACCESS_KEY_EXPIRE || "",
    refreshKey: process.env.REFRESH_KEY || "",
    refreshKeyExpire: process.env.REFRESH_KEY_EXPIRE || "",
    baseUrl:process.env.BASE_URL || "",
    smtpHost:process.env.SMTP_HOST || "smtp.gmail.com",
    smtpPort:process.env.SMTP_PORT || "",
    email_user:process.env.SMTP_USER || "",
    email_pass:process.env.SMTP_PASS || "",
    email_from:process.env.EMAIL_FROM || "",
    cloudinaryCloudName:process.env.CLOUDINARY_CLOUD_NAME || "",
    cloudinaryApiKey:process.env.CLOUDINARY_API_KEY || "",
    cloudinaryApiSecret:process.env.CLOUDINARY_API_SECRET || "",
    cloudinaryUrl:process.env.CLOUDINARY_URL || ""
}
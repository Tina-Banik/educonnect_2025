import "dotenv/config"
interface AppConfig{
    port : number | string;
    apiUrl: string;
    accessKey:string;
    accessKeyExpireTime:string;
    refreshKey:string;
    refreshKeyExpire:string
}

export const config:AppConfig = {
    port: process.env.PORT || "",
    apiUrl: process.env.API_URL || "",
    accessKey: process.env.ACCESS_KEY  || "",
    accessKeyExpireTime: process.env.ACCESS_KEY_EXPIRE || "",
    refreshKey: process.env.REFRESH_KEY || "",
    refreshKeyExpire: process.env.REFRESH_KEY_EXPIRE || ""
}
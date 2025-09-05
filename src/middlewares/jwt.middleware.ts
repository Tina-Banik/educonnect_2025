import  jwt from "jsonwebtoken";
// const jwt = require("jsonwebtoken");
import crypto from "crypto"
import { config } from "../../types/type";
function generateToken(length:number):string{
    return crypto.randomBytes(length).toString("hex");
}
/**generating the access token */
const access_key  = config.accessKey || generateToken(64);
const create_accessToken = async(uid:string,email:string,role:string)=>{
    if(access_key){
        const access_token = await (jwt as any).sign({uid:uid,email:email,role:role==="admin"?"admin":"user"},access_key,{expiresIn:config.accessKeyExpireTime});
        return access_token;
    }
}
/**generating the refresh token */
const refresh_key = config.refreshKey || generateToken(64);
const create_refreshToken = async(uid:string,email:string)=>{
    if(refresh_key){
        const refresh_token = await (jwt as any).sign({uid:uid,email:email},refresh_key,{expiresIn:config.refreshKeyExpire});
        return refresh_token;
    }
} 
export {create_accessToken, create_refreshToken}
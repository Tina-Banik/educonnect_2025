import  jwt from "jsonwebtoken";
// const jwt = require("jsonwebtoken");
import crypto from "crypto"
import { config } from "../../types/type";
import { prismaClient } from "../../db/db.connection";
function generateToken(length:number):string{
    return crypto.randomBytes(length).toString("hex");
}
/***
 * So no, you don’t need to write a separate query to check if the user is an admin elsewhere. Instead, you should leverage the  from  (which you already populate in ) to enforce role-based access control in your route logic.
 */
/**generating the access token */
const access_key  = config.accessKey || generateToken(64);
const create_accessToken = async(uid:string,email:string,role:string)=>{
    if(access_key){
        const access_token = await (jwt as any).sign({uid:uid,email:email,role:role==="admin"?"admin":"user"},access_key,{expiresIn:config.accessKeyExpireTime});
         console.log('creating access token with pay load:', {uid,email});
        return access_token;
    }
}
/**generating the refresh token */
const refresh_key = config.refreshKey || generateToken(64);
const create_refreshToken = async(uid:string,email:string)=>{
    if(refresh_key){
        const refresh_token = await (jwt as any).sign({uid:uid,email:email},refresh_key,{expiresIn:config.refreshKeyExpire});
        console.log('creating refresh token with pay load:', {uid,email});
        return refresh_token;
    }
} 
export {create_accessToken, create_refreshToken}
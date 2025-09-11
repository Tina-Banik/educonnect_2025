import { JwtPayload } from "jsonwebtoken";
declare global{
    namespace Express{
        interface Request{
            decode?:string | JwtPayload | TokenPayload 
        }
    }
}
interface TokenPayload extends JwtPayload{
    uid:string;
    email:string;
    role?:string;  // optional, since refresh token doesn’t have it
}
// interface LogoutPayload extends JwtPayload{
//     uid:string;
//     email:string;
// }
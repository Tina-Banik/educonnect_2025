import { JwtPayload } from "jsonwebtoken";
declare global{
    namespace Express{
        interface Request{
            decode?:string | JwtPayload | TokenPayload | LogoutPayload
        }
    }
}
interface TokenPayload extends JwtPayload{
    uid:string;
    email:string;
    role:string;
}
interface LogoutPayload extends JwtPayload{
    uid:string;
    email:string;
}
import {Router} from "express"
const authRoute = Router();
import { login, refreshAccessToken, register, sendOtpPhone, verifyEmail, verifyPhone} from "../controllers/admin.controller";
import { adminRegisterValidation } from "../../utils/adminValidation";
import { handleValidationErrors } from "../middlewares/validationHandler";
import { verifyRefreshToken } from "../middlewares/auth.middleware";
authRoute.post("/admin-signup",adminRegisterValidation,handleValidationErrors,register);
authRoute.post("/admin-login",login);
authRoute.get("/verify-email",verifyEmail);
authRoute.post("/verify-phone",verifyPhone);
authRoute.post("/send-otp",sendOtpPhone);
/**create the  route for the new access token */
authRoute.post("/refresh-access-token",verifyRefreshToken,refreshAccessToken);
export default authRoute;
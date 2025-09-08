import {Router} from "express"
const authRoute = Router();
import {  createNotifications, login, refreshAccessToken, register, sendOtpPhone, updateKycDetails, verifyEmail, verifyPhone} from "../controllers/admin.controller";
import { adminRegisterValidation } from "../../utils/adminValidation";
import { handleValidationErrors } from "../middlewares/validationHandler";
import { verifyAccessToken, verifyRefreshToken } from "../middlewares/auth.middleware";
import { notificationValidation } from "../../utils/notificationVlidation";
import { kycFileFields } from "../../utils/kycFileField";
import { kycUpload } from "../../file/fileUpload";
authRoute.post("/admin-signup",adminRegisterValidation,handleValidationErrors,register);
authRoute.post("/admin-login",login);
authRoute.get("/verify-email",verifyEmail);
authRoute.post("/verify-phone",verifyPhone);
authRoute.post("/send-otp",sendOtpPhone);

/**create the  route for the new access token */
authRoute.post("/refresh-access-token",verifyRefreshToken,refreshAccessToken);

/**here I am  write the api for the notifications 
 * 1.create the api for new notifications
 * 2.fetch all the notifications of an user
*/
authRoute.post('/create-notification',notificationValidation,verifyAccessToken,createNotifications);
// authRoute.get('/:userId',getNotificationsUser);
// authRoute.patch('/:notificationId/read',markAsRead);

/**here I write the route for the kyc upload */
authRoute.post('/kyc/upload', kycUpload.fields(kycFileFields),updateKycDetails);
export default authRoute;
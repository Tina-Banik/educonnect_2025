import {Router} from "express"
const authRoute = Router();
import {  adminLogout, createNotifications, getDashboard, getProfile, login, refreshAccessToken, register, sendOtpPhone, updateKycDetails, updateProfile, verifyEmail, verifyPhone} from "../controllers/admin.controller";
import { adminRegisterValidation } from "../../utils/adminValidation";
import { handleValidationErrors } from "../middlewares/validationHandler";
import { verifyAccessToken, verifyRefreshToken } from "../middlewares/auth.middleware";
import { notificationValidation } from "../../utils/notificationVlidation";
import { checkInstituteType, dynamicUpload } from "../../utils/kycFileField";
import { isAdmin } from "../../utils/roleValidation";
// import { dynamicKycUpload} from "../../utils/kycFileField";
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
authRoute.post('/kyc/upload',verifyAccessToken,isAdmin,checkInstituteType,dynamicUpload, updateKycDetails);

/** for the /profile api - (a)get the profile (b)update the profile */
authRoute.get('/admin-profile',verifyAccessToken,getProfile)
authRoute.put('/admin-update',verifyAccessToken,updateProfile)

/**for show thw dashboard */
authRoute.get('/admin-dashboard',verifyAccessToken,getDashboard);

/**here I write the code for the logout */
authRoute.post('/admin-logout', verifyRefreshToken,adminLogout)
export default authRoute;
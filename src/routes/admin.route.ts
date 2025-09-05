import {Router} from "express"
const authRoute = Router();
import { login, register, verifyEmail, verifyPhone} from "../controllers/admin.controller";
import { adminRegisterValidation } from "../../utils/adminValidation";
import { handleValidationErrors } from "../middlewares/validationHandler";
authRoute.post("/admin-signup",adminRegisterValidation,handleValidationErrors,register);
authRoute.post("/admin-login",login);
authRoute.get("/verify-email",verifyEmail);
authRoute.post("/verify-phone",verifyPhone);
export default authRoute;
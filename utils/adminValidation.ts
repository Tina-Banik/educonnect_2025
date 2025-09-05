import { body } from "express-validator";

export const adminRegisterValidation =[
    body("instituteName").notEmpty().trim().withMessage("Institute name is required"),
    body("instituteType").isIn(["coaching_center","educational_institute","corporate_training","individual_tutor"]).withMessage("Institute Type must be one of the predefined options"),
    body("fullName").trim().notEmpty().withMessage("Admin Full Name is required"),
    body("email").isEmail().withMessage("Valid Official Address is required"),
    body("phoneNumber").matches(/^\+[1-9]\d{1,14}$/).withMessage("Phone number must be required with 164 format."),
    body("instituteAddress").notEmpty().trim().withMessage("Institute address is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("state").trim().notEmpty().withMessage("State is required"),
    body("postalCode").trim().notEmpty().withMessage("Postal code is required"),
    /**password validation */
    body("password").trim().notEmpty().isLength({min:8}).withMessage("Password must be at least 8 characters")
    .matches(/[a-z]/).withMessage("Password must be contain at least on small case")
    .matches(/[A-Z]/).withMessage("Password must be al least one uppercase letters")
    .matches(/\d/).withMessage("Password must contain all the digits")
    .matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one special character"),
    /**confirm password validation remove this*/
    body("confirmPassword").custom((value , {req})=> value === req.body.password).withMessage("Password and conform password must be same"),
    /** for role */
      body("role").trim().notEmpty().withMessage("Role is required"),
    /**boolean for the accepted terms */
    body("acceptedTerms").isBoolean().withMessage("Accepted terms and conditions must be boolean").equals("true").withMessage("You must be accepted the terms and conditions"),
    /**boolean for the accepted privacy */
    body("acceptedPrivacy").isBoolean().withMessage("Accepted private policy must be boolean").equals("true")
    .withMessage("You must accept the private policy")
];
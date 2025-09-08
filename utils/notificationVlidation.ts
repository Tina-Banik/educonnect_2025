import { body } from "express-validator";
/**here I write the code for the notification validation */
export const notificationValidation = [
    body("type").isIn(["statusChange","info","error"]).withMessage("Invalid Notification Type"),
    body("title").isString().trim().notEmpty().withMessage("Title is required"),
    body("message").isString().trim().notEmpty().withMessage("Message is required"),
];
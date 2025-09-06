import nodemailer from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { config } from "../types/type"
const smtpOptions:SMTPTransport.Options ={
    host: config.smtpHost,
    port: Number(config.smtpPort),
    secure: Number(config.smtpPort)===465, // true for 465, false for other ports
    auth: {
    user: config.email_user,
    pass: config.email_pass,
}
}
//mailgun
const transporter = nodemailer.createTransport(smtpOptions);
export const sendVerificationEmail = async(to:string, token:string)=>{
    const verificationLink = `${config.baseUrl}${config.apiUrl}/admin/verify-email?token=${token}`;
    console.log(`The verification link is : ${verificationLink}`);
    const htmlContent = `
     <!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>Verify your email</title>
  </head>
  <body style="font-family: Arial, sans-serif; background:#f6f9fc; margin:0; padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; margin:40px 0; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,.1);">
            <tr>
              <td style="padding:30px; text-align:center;">
                <h1 style="margin:0; font-size:22px;">Welcome to <strong>Your App</strong></h1>
                <p style="color:#6b7280;">Hi ${config.email_user}, please verify your email address to get started.</p>
                <a href="${verificationLink}" style="display:inline-block; margin-top:18px; padding:12px 22px; border-radius:6px; text-decoration:none; font-weight:600; background:#2563eb; color:#fff;">
                  Verify Email
                </a>
                <p style="color:#9ca3af; font-size:12px; margin-top:20px;">
                  If the button doesn't work, copy and paste the following link into your browser:
                  <br/>
                  <a href="${verificationLink}" style="color:#2563eb; word-break:break-all;">${verificationLink}</a>
                </p>
                <hr style="border:none; border-top:1px solid #eee; margin:26px 0;" />
                <p style="font-size:12px; color:#9ca3af;">If you didn't sign up, you can safely ignore this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
  await transporter.sendMail({
    from: `"E-technology" <${config.email_from}>`,
    to:`${config.email_user}`,
    subject:"Attach The Cover Letter",
    html:htmlContent,
  }).catch(error=>{console.error(error.message)});
  console.log("The email has been sent");
}
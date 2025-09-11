🛠️ Educonnect Backend API This project is the backend for the Educonnect application, a SaaS platform built using a modern and robust tech stack. It provides all the necessary API endpoints for user authentication, registration, and email/phone verification. The application leverages a UUID-based system for user identification and a JWT-based authentication flow for secure access.  
🚀 Tech Stack  
Node.js + Express — Fast and minimalist server framework  
TypeScript — Type-safe development  
Prisma ORM — Elegant database access with PostgreSQL/MySQL  
JWT — Secure authentication  
Bcrypt — Password hashing  
Dotenv — Environment variable management  
Email Service: Nodemailer  
📁 Project Structure  
src/ ├── config/ Centralized config management ├── controllers/  
Route handlers ├── db/ 
Prisma client setup ├── middlewares/  
Auth and validation middleware ├── routes/  
Express route definitions ├── generated/  
Prisma client output └── main.ts // Register POST /api/user/register // Login POST /api/user/login // Protected route GET /api/user/admin-profile  
✨ Features User Authentication:  
Secure register and login functionality with password hashing. Email Verification: Utilizes Nodemailer to send verification links to users upon registration. Phone Verification: Includes an endpoint for phone number verification. Type-Safe Development: Built with TypeScript to ensure code quality and maintainability. - Modular service and controller layers ⚙️ Prerequisites Before you begin, ensure you have the following installed on your system: Node.js (LTS version recommended) , PostgreSQL (with a running instance)  
Phone Number Verification  
• Refactored function to:  
• Validate user existence and phone verification status.  
• Check OTP expiry and attempt limits.  
• Prevent OTP regeneration during verification.  
• Return accurate messages (e.g., "Phone is already verified").  
• Created a separate endpoint to:  
• Generate and send OTP only when explicitly requested.  
• Avoid overwriting OTP during verification.  
• Log user details and OTP dispatch status.  
Email Verification  
• Implemented email token generation during registration using: Saved and to the database.  
• Built endpoint to: Validate token and expiry.  
• Update status securely. • Prevent token reuse by nullifying it post-verification.  

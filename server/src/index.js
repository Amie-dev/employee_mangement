import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.db.js";
import errorHandler from "./middleware/errorHandler.js";
dotenv.config({
    path:"./.env"
})


const port =process.env.PORT || 8000


// import { sendMail, emailVerificationMailgenContent } from './utils/mail.js';

// const username = "John Doe";
// const email = "john@example.com";
// const verificationUrl = "https://taskmanager.app/verify?token=abc123";

// const mailgenContent = emailVerificationMailgenContent(username, verificationUrl);

// const result = await sendMail({
//   email,
//   subject: "Verify your email",
//   mailgenContent,
// });

// if (result.success) {
//   console.log("Verification email sent!");
// } else {
//   console.error("Failed to send email:", result.error);
// }

app.use(errorHandler);

connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`server is listend at port ${port}`);
        
    })
})
.catch((error)=>{
    console.log(`Server is fialed to connect ${error}`);
    process.exit(1)
})
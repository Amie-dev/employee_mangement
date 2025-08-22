import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.db.js";

dotenv.config({
    path:"./.env"
})


const port =process.env.PORT || 8000


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
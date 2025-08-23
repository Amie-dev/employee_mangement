import express from "express";
import cors from "cors"
import dotenv from 'dotenv'



const app=express()
dotenv.config()
app.use(express.json())

app.use(cors({
    origin:process.env.CORS_ORIGINE,
    credentials:true
}))

app.use(express.urlencoded());
app.use(express.static("public"))


//import router
import healthRouter from "./router/healthcheck.router.js";

app.use("/api/v1/health",healthRouter)






export default app
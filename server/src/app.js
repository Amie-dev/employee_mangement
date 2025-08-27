import express from "express";
import cors from "cors"
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"


const app=express()
dotenv.config()
app.use(express.json())

app.use(cors({
    origin:process.env.CORS_ORIGINE,
    credentials:true
}))

app.use(express.urlencoded());
app.use(express.static("public"))
app.use(cookieParser())

//import router
import healthRouter from "./router/healthcheck.router.js";
import userRouter from './router/user.router.js'
import projectRouter from "./router/project.router.js"
import noteRouter from "./router/note.router.js"

app.use("/api/v1/health",healthRouter)
app.use("/api/v1/user",userRouter)
app.use("/api/v1/project",projectRouter)
app.use("/api/v1/project",noteRouter)





export default app
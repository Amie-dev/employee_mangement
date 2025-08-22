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






export default app
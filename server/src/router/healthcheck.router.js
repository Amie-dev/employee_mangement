import {Router} from "express";
import { healthCheck } from "../controller/healthcheck.controller.js";

const healthRouter=Router();


healthRouter.get("/health-check",healthCheck)

export default healthRouter
import { validationResult} from "express-validator"
import ApiError from "../utils/ApiError"
const validatro=(req,res,next)=>{
    const error=validationResult(req);
    if (error.isEmpty()) {
        return next()
    }

    const extrectError=[];
    error.array().map((err)=>{
        extrectError.push({
            [err.path]:err.msg
        })
    })

    throw new ApiError(422,"Recive Error Message",extrectError)
}

export {validatro}
import ApiResponse  from "../utils/ApiResponse.js"

 export const healthCheck=(_,res)=>{
    res.status(200).json(new ApiResponse(200,{message:"Everthing Ok"},"Ok"))
}

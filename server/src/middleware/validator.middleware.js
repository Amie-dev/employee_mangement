import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

const validator = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map(err => ({
    field: err.path,
    message: err.msg,
    value: err.value // optional: include the invalid value
  }));

  // Optional: log errors for debugging
  if (process.env.NODE_ENV !== 'production') {
    // console.error("Validation errors:", extractedErrors);
  }

//   console.log(extractedErrors);
//   console.log("Raw errors:", errors.array());

  
  throw new ApiError(422, "Validation failed: input data is invalid", extractedErrors);
};

export { validator };

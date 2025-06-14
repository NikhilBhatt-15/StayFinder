import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  // Log the error for debugging purposes
  console.error(err);
  // Check if the error is an instance of ApiError
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json(new ApiError(err.statusCode, err.message));
  }
  // Handle other types of errors
  return res.status(500).json(new ApiError(500, "Internal Server Error"));
};

// Export the error middleware
export default errorMiddleware;
// This middleware should be used after all other routes and middlewares

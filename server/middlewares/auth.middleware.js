import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log(new ApiError(401, "No token provided"));
      return res
        .status(401)
        .json(new ApiError(401, "Unauthorized, please login first"));
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded || !decoded.id) {
      return res
        .status(401)
        .json(new ApiError(401, "Invalid or expired token"));
    }
    const user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res
        .status(404)
        .json(new ApiError(401, "Invalid token or user not found"));
    }
    req.user = user; // Attach user to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Authentication error:", error);
    return res
      .status(404)
      .json(new ApiError(401, error.message || "Unauthorized"));
  }
};

// Export the auth middleware
export default authMiddleware;
// This middleware should be used in routes that require authentication

import ApiError from "../utils/ApiError.js";

const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(new ApiError(401, "Unauthorized, please login first"));
      }

      const user = req.user;
      if (user.role !== requiredRole) {
        return res
          .status(403)
          .json(
            new ApiError(403, `Access denied. Required role: ${requiredRole}`)
          );
      }
      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      return res
        .status(500)
        .json(new ApiError(500, "Does not have permission"));
    }
  };
};

// Export the role middleware
export default roleMiddleware;
// This middleware should be used in routes that require specific user roles

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      success: this.success,
    };
  }
  static badRequest(message) {
    return new ApiError(400, message || "Bad Request");
  }
  static unauthorized(message) {
    return new ApiError(401, message || "Unauthorized");
  }
  static forbidden(message) {
    return new ApiError(403, message || "Forbidden");
  }
  static notFound(message) {
    return new ApiError(404, message || "Not Found");
  }
  static conflict(message) {
    return new ApiError(409, message || "Conflict");
  }
  static internalServerError(message) {
    return new ApiError(500, message || "Internal Server Error");
  }
  static serviceUnavailable(message) {
    return new ApiError(503, message || "Service Unavailable");
  }
}
export default ApiError;

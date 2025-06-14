class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.status = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode > 400 ? false : true;
  }

  static success(
    statusCode = 200,
    data = null,
    message = "Request was successful"
  ) {
    return new ApiResponse(statusCode, message, data);
  }
  static error(status = 400, message = "An error occurred", data = null) {
    return new ApiResponse(status, message, data);
  }
}

export default ApiResponse;

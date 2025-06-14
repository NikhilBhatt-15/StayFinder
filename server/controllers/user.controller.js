import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import {
  nameValidator,
  emailValidator,
  passwordValidator,
} from "../utils/validation.js";

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (role && role !== "guest" && role !== "host") {
      throw new ApiError(
        400,
        "Invalid role. Allowed roles are 'guest' or 'host'."
      );
    }
    if (!name || !email || !password) {
      throw new ApiError(
        400,
        "Please provide all required fields: name, email, password"
      );
    }
    const isValidName = nameValidator(name);
    const isValidEmail = emailValidator(email);
    const isValidPassword = passwordValidator(password);

    if (!isValidName.isValid) throw new ApiError(400, isValidName.message);
    if (!isValidEmail.isValid) throw new ApiError(400, isValidEmail.message);
    if (!isValidPassword.isValid)
      throw new ApiError(400, isValidPassword.message);

    const localpath = req.file?.path;
    if (!localpath) {
      throw new ApiError(400, "Please upload an avatar image");
    }
    const secure_url = await uploadOnCloudinary(localpath, "avatar");
    if (!secure_url) {
      throw new ApiError(500, "Failed to upload avatar image");
    }

    const existedUser = await User.findOne({ email: email.toLowerCase() });
    if (existedUser) {
      throw new ApiError(400, "User already exists with this email");
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password.trim(),
      avatar: secure_url,
      role: role || "guest", // Default to 'guest' if no role is provided
    });
    if (!user) {
      throw new ApiError(500, "Failed to create user");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(201).json(
      new ApiResponse(201, "User registered successfully", {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      })
    );
  } catch (error) {
    next(error);
    // Pass the error to the next middleware for centralized error handling
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "Please provide both email and password");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(404, "User not found with this email");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Incorrect password");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json(
      new ApiResponse(200, "User logged in successfully", {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
        accessToken: accessToken,
        refreshToken: refreshToken,
      })
    );
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new ApiError(401, "No refresh token provided");
    }
    // do i need to verify the refresh token?
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded || !decoded.id) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const newAccessToken = user.generateAccessToken();
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json(
      new ApiResponse(200, "Access token refreshed successfully", {
        accessToken: newAccessToken,
      })
    );
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
      throw new ApiError(
        400,
        "Please provide email, old password and new password"
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(404, "User not found with this email");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Incorrect old password");
    }

    user.password = newPassword; // This will trigger the pre-save hook to hash the password
    await user.save();

    res.status(200).json(new ApiResponse(200, "Password reset successfully"));
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = req.user; // User is attached to the request by auth middleware
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    res.status(200).json(
      new ApiResponse(200, "User profile retrieved successfully", {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json(new ApiResponse(200, "User logged out successfully"));
  } catch (error) {
    next(error);
  }
};

export { register, login, refreshToken, logout, resetPassword, getUserProfile };

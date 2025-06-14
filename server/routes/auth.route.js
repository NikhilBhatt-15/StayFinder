import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  login,
  register,
  logout,
  refreshToken,
  getUserProfile,
  resetPassword,
} from "../controllers/user.controller.js";
const app = Router();

app.post("/login", login);
app.post("/register", upload.single("avatar"), register);
app.post("logout", authMiddleware, logout);
app.get("/me", authMiddleware, getUserProfile);
app.post("/refresh-token", refreshToken);
app.post("/reset-password", authMiddleware, resetPassword);

export default app;

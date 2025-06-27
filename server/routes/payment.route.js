import { Router } from "express";

const app = Router();
import { createRazorpayOrder } from "../controllers/payment.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

app.post("/order", authMiddleware, createRazorpayOrder);

export default app;

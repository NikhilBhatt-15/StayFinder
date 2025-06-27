import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import {
  getOwnBookings,
  createBooking,
  getGuestBookings,
} from "../controllers/booking.controller.js";

const app = Router();

app.get("/own", authMiddleware, roleMiddleware("host"), getOwnBookings);
app.post("/create", authMiddleware, createBooking);
app.get("/guest", authMiddleware, getGuestBookings);

export default app;

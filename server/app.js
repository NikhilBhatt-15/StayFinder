import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// Middleware to handle CORS
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Middleware to parse cookies
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the StayFinder API",
  });
});

import userRoutes from "./routes/auth.route.js";
import listingRoutes from "./routes/listing.route.js";

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/listing", listingRoutes);
// Import and use the error middleware
app.use(errorMiddleware);
export default app;

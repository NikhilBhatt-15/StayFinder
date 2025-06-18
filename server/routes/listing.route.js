import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createListing,
  getAllListings,
  getListingById,
  getListingsByHostId,
  getOwnListings,
  updateListing,
  deleteListing,
} from "../controllers/listing.controller.js";
const app = Router();

app.post("/create", authMiddleware, upload.array("images", 5), createListing);
app.get("/all", getAllListings);
app.get("/own", authMiddleware, getOwnListings);
app.get("/:id", getListingById);
app.get("/host/:hostId", authMiddleware, getListingsByHostId);
app.delete("/delete/:id", authMiddleware, deleteListing);
app.put(
  "/update/:id",
  authMiddleware,
  upload.array("images", 5),
  updateListing
);

export default app;

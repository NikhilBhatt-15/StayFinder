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
  likeListing,
  getLikedListings,
  saveListing,
  getSavedListings,
} from "../controllers/listing.controller.js";
const app = Router();

app.post("/create", authMiddleware, upload.array("images", 5), createListing);
app.get("/all", getAllListings);
app.get("/own", authMiddleware, getOwnListings);
app.get("/:id", getListingById);
app.get("/host/:hostId", authMiddleware, getListingsByHostId);
app.delete("/delete/:id", authMiddleware, deleteListing);
app.post("/like/:id", authMiddleware, likeListing);
app.get("/liked", authMiddleware, getLikedListings);
app.post("/save/:id", authMiddleware, saveListing);
app.get("/saved", authMiddleware, getSavedListings);
app.put(
  "/update/:id",
  authMiddleware,
  upload.array("images", 5),
  updateListing
);

export default app;

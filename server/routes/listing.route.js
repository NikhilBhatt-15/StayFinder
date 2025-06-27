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
  searchListings,
} from "../controllers/listing.controller.js";
import roleMiddleware from "../middlewares/role.middleware.js";
const app = Router();

app.post(
  "/create",
  authMiddleware,
  roleMiddleware("host"),
  upload.array("images", 5),
  createListing
);
app.get("/all", getAllListings);
app.get("/own", authMiddleware, roleMiddleware("host"), getOwnListings);

app.get("/host/:hostId", authMiddleware, getListingsByHostId);
app.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("host"),
  deleteListing
);
app.post("/like/:id", authMiddleware, likeListing);
app.get("/liked", authMiddleware, getLikedListings);
app.post("/save/:id", authMiddleware, saveListing);
app.get("/saved", authMiddleware, getSavedListings);
app.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware("host"),
  upload.array("images", 5),
  updateListing
);

app.get("/search", searchListings);
app.get("/:id", getListingById);
export default app;

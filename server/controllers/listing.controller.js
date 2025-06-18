import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Listing } from "../models/listing.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const createListing = async (req, res, next) => {
  try {
    let {
      title,
      description,
      location,
      pricePerNight,
      availableDates,
      amenities,
      city,
      country,
      address,
    } = req.body;
    if (
      !title ||
      !description ||
      !location ||
      !pricePerNight ||
      !availableDates ||
      !city ||
      !country ||
      !address
    ) {
      throw new ApiError(
        400,
        "Please provide all required fields: title, description, location, pricePerNight, availableDates , city, country, address"
      );
    }

    availableDates = JSON.parse(availableDates);
    amenities = amenities ? JSON.parse(amenities) : [];
    location = typeof location === "string" ? JSON.parse(location) : location;

    // Step 2: Validate coordinates
    if (
      !location.coordinates ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      throw new ApiError(
        400,
        "Location must include coordinates in [longitude, latitude] format"
      );
    }

    // Step 3: Ensure GeoJSON format for MongoDB
    location = {
      type: "Point",
      coordinates: location.coordinates,
    };
    if (!Array.isArray(availableDates) || availableDates.length === 0) {
      throw new ApiError(
        400,
        "Available dates must be an array with at least one date range"
      );
    }
    for (const range of availableDates) {
      if (new Date(range.from) >= new Date(range.to)) {
        throw new ApiError(400, "Each date range must have from < to");
      }
    }
    if (amenities && !Array.isArray(amenities)) {
      throw new ApiError(400, "Amenities must be an array");
    }
    const localpath = req.files?.map((file) => file.path);
    if (!localpath || localpath.length === 0) {
      throw new ApiError(
        400,
        "Please upload atleast one image for the listing"
      );
    }
    const imageUrls = await Promise.all(
      localpath.map(async (path) => {
        const secureUrl = await uploadOnCloudinary(path);
        return secureUrl;
      })
    );
    if (!imageUrls || imageUrls.length === 0) {
      throw new ApiError(500, "Failed to upload images");
    }
    const listing = await Listing.create({
      title: title.trim(),
      description: description.trim(),
      location,
      pricePerNight: parseFloat(pricePerNight),
      images: imageUrls,
      host: req.user._id,
      availableDates,
      city: city.trim(),
      country: country.trim(),
      address: address.trim(),

      amenities: amenities || [],
    });

    if (!listing) {
      throw new ApiError(500, "Failed to create listing");
    }
    res
      .status(201)
      .json(new ApiResponse(201, "Listing created successfully", listing));
  } catch (error) {
    next(error);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || id.trim() === "") {
      throw new ApiError(400, "Listing ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Listing ID is not valid");
    }
    const listing = await Listing.findById(id).populate(
      "host",
      "-password -refreshToken"
    );
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, "Listing retrieved successfully", listing));
  } catch (error) {
    next(error);
  }
};

const getAllListings = async (req, res, next) => {
  try {
    const listings = await Listing.find().populate(
      "host",
      "-password -refreshToken"
    );
    res
      .status(200)
      .json(new ApiResponse(200, "Listings retrieved successfully", listings));
  } catch (error) {
    next(error);
  }
};

const getOwnListings = async (req, res, next) => {
  try {
    const hostId = req.user._id;
    if (!hostId) {
      throw new ApiError(400, "Host ID is required");
    }
    const listings = await Listing.find({ host: hostId }).populate(
      "host",
      "-password -refreshToken"
    );
    if (!listings || listings.length === 0) {
      throw new ApiError(404, "No listings found for this host");
    }
    res
      .status(200)
      .json(new ApiResponse(200, "Listings retrieved successfully", listings));
  } catch (error) {
    next(error);
  }
};

const getListingsByHostId = async (req, res, next) => {
  try {
    const { hostId } = req.params;
    if (!hostId) {
      throw new ApiError(400, "Host ID is required");
    }
    const listings = await Listing.find({ host: hostId }).populate(
      "host",
      "-password -refreshToken"
    );
    if (!listings || listings.length === 0) {
      throw new ApiError(404, "No listings found for this host");
    }
    res
      .status(200)
      .json(new ApiResponse(200, "Listings retrieved successfully", listings));
  } catch (error) {
    next(error);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ApiError(400, "Listing ID is required");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }
    // Check if the user is the host of the listing
    if (listing.host.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to update this listing");
    }
    const {
      title,
      description,
      location,
      pricePerNight,
      availableDates,
      amenities,
    } = req.body;
    if (
      !title ||
      !description ||
      !location ||
      !pricePerNight ||
      !availableDates
    ) {
      throw new ApiError(
        400,
        "Please provide all required fields: title, description, location, pricePerNight, availableDates"
      );
    }
    if (!Array.isArray(availableDates) || availableDates.length === 0) {
      throw new ApiError(
        400,
        "Available dates must be an array with at least one date range"
      );
    }
    if (amenities && !Array.isArray(amenities)) {
      throw new ApiError(400, "Amenities must be an array");
    }
    if (
      location &&
      (!location.city ||
        !location.country ||
        !location.address ||
        !location.coordinates)
    ) {
      throw new ApiError(
        400,
        "Location must include city, country, address, and coordinates"
      );
    }
    const newListingData = {
      title: title.trim(),
      description: description.trim(),
      location,
      pricePerNight: parseFloat(pricePerNight),
      availableDates,
      amenities: amenities || [],
    };
    if (req.files?.images) {
      const localpath = req.files.images.map((file) => file.path);
      const imageUrls = await Promise.all(
        localpath.map(async (path) => {
          const secureUrl = await uploadOnCloudinary(path);
          return secureUrl;
        })
      );
      if (!imageUrls || imageUrls.length === 0) {
        throw new ApiError(500, "Failed to upload images");
      }
      newListingData.images = imageUrls;
    }
    const updatedListing = await Listing.findByIdAndUpdate(id, newListingData, {
      new: true,
    }).populate("host", "-password -refreshToken");
    if (!updatedListing) {
      throw new ApiError(500, "Failed to update listing");
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, "Listing updated successfully", updatedListing)
      );
  } catch (error) {
    next(error);
  }
};

const deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ApiError(400, "Listing ID is required");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }
    // Check if the user is the host of the listing
    if (listing.host.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to delete this listing");
    }
    await Listing.findByIdAndDelete(id);
    res.status(200).json(new ApiResponse(200, "Listing deleted successfully"));
  } catch (error) {
    next(error);
  }
};

const likeListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ApiError(400, "Listing ID is required");
    }
    // check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Listing ID is not valid");
    }
    const listing = await Listing.findById(id).lean();
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }
    // Check if the user has already liked the listing
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (user.likedListings.includes(id)) {
      // User has already liked the listing, so remove the like
      user.likedListings = user.likedListings.filter(
        (listingId) => listingId.toString() !== id
      );
      await user.save();
      res.status(200).json(
        new ApiResponse(200, "Listing unliked successfully", {
          liked: false,
          listingId: id,
        })
      );
    } else {
      // User has not liked the listing, so add the like
      user.likedListings.push(id);
      await user.save();
      res.status(200).json(
        new ApiResponse(200, "Listing liked successfully", {
          liked: true,
          listingId: id,
        })
      );
    }
  } catch (error) {
    next(error);
  }
};
const getLikedListings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }
    const user = await User.findById(userId).populate("likedListings");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (!user.likedListings || user.likedListings.length === 0) {
      throw new ApiError(404, "No liked listings found for this user");
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Liked listings retrieved successfully",
          user.likedListings
        )
      );
  } catch (error) {
    next(error);
  }
};

const saveListing = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      throw new ApiError(400, "Listing ID is required");
    }
    // check if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Listing ID is not valid");
    }
    const listing = await Listing.findById(id).lean();
    if (!listing) {
      throw new ApiError(404, "Listing not found");
    }
    // Check if the user has already saved the listing
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (user.savedListings.includes(id)) {
      // User has already saved the listing, so remove the save
      user.savedListings = user.savedListings.filter(
        (listingId) => listingId.toString() !== id
      );
      await user.save();
      res.status(200).json(
        new ApiResponse(200, "Listing unsaved successfully", {
          saved: false,
          listingId: id,
        })
      );
    } else {
      // User has not saved the listing, so add the save
      user.savedListings.push(id);
      await user.save();
      res.status(200).json(
        new ApiResponse(200, "Listing saved successfully", {
          saved: true,
          listingId: id,
        })
      );
    }
  } catch (error) {
    next(error);
  }
};

const getSavedListings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }
    const user = await User.findById(userId).populate("savedListings");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (!user.savedListings || user.savedListings.length === 0) {
      throw new ApiError(404, "No saved listings found for this user");
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Saved listings retrieved successfully",
          user.savedListings
        )
      );
  } catch (error) {
    next(error);
  }
};

export {
  createListing,
  getAllListings,
  getListingById,
  getOwnListings,
  getListingsByHostId,
  updateListing,
  deleteListing,
  likeListing,
  getLikedListings,
  saveListing,
  getSavedListings,
};

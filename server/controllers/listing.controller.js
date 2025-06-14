import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Listing } from "../models/listing.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const createListing = async (req, res, next) => {
  try {
    let {
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
    availableDates = JSON.parse(availableDates);
    amenities = amenities ? JSON.parse(amenities) : [];
    location = JSON.parse(location);
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
    console.log("req.files", req.files);

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

export {
  createListing,
  getAllListings,
  getListingById,
  getOwnListings,
  getListingsByHostId,
  updateListing,
};

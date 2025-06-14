import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { Booking } from "../models/booking.model.js";
import { Listing } from "../models/listing.model.js";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}?retryWrites=true`
    );
    console.log(`MongoDB connected`);
    await Booking.collection.createIndex({
      listing: 1,
      checkIn: 1,
      checkOut: 1,
    });

    // Index to quickly list all listings by host
    await Listing.collection.createIndex({ host: 1 });

    // If using GeoJSON for maps (below)
    await Listing.collection.createIndex({
      "location.coordinates": "2dsphere",
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;

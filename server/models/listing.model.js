import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    location: {
      city: String,
      country: String,
      address: String,
      coordinates: { lat: Number, lng: Number },
    },
    pricePerNight: { type: Number, required: true },
    images: [String], // array of image URLs
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    availableDates: [
      {
        from: Date,
        to: Date,
      },
    ],
    isBooked: { type: Boolean, default: false },
    amenities: {
      type: [String],
      enum: [
        "WiFi",
        "Air Conditioning",
        "Kitchen",
        "Parking",
        "Pets Allowed",
        "Pool",
        "Gym",
        "TV",
        "Washer",
        "Dryer",
        "Heating",
        "Smoke Detector",
        "Carbon Monoxide Detector",
        "Fire Extinguisher",
        "Essentials",
        "Hangers",
        "Iron",
        "Hair Dryer",
        "Laptop Friendly Workspace",
        "Self Check-In",
        "Hot Water",
      ],
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

export const Listing = mongoose.model("Listing", listingSchema);

import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (value) {
            return (
              value.length === 2 &&
              value[0] >= -180 &&
              value[0] <= 180 &&
              value[1] >= -90 &&
              value[1] <= 90
            );
          },
          message: "Coordinates must be [longitude, latitude]",
        },
      },
    },
    city: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    images: [String], // array of image URLs
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    }, // reference to the User model
    isDeleted: { type: Boolean, default: false },
    availableDates: [
      {
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: Date,
          required: true,
          validate: {
            validator: function (value) {
              return this.from < value;
            },
            message: "End date must be after start date",
          },
        },
      },
    ],
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
listingSchema.virtual("averageRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const total = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return total / this.reviews.length;
});

export const Listing = mongoose.model("Listing", listingSchema);

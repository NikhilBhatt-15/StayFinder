import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true, // Index for faster queries
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkIn: { type: Date, required: true },
    checkOut: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return this.checkIn < value;
        },
        message: "checkOut must be after checkIn",
      },
    },
    nights: { type: Number },
    totalPrice: { type: Number, required: true },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);

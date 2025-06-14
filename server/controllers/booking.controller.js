import { Booking } from "../models/booking.model";
import { Listing } from "../models/listing.model";
import mongoose from "mongoose";
import dayjs from "dayjs";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";

export const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession(); // for atomicity
  session.startTransaction();

  try {
    // ---------- 1. pull & normalise -----------------
    const { listingId, startDate, endDate } = req.body;

    if (!listingId || !startDate || !endDate) {
      throw new ApiError(400, "listingId, startDate, endDate are required");
    }

    const checkIn = dayjs(startDate).startOf("day").toDate();
    const checkOut = dayjs(endDate).startOf("day").toDate();

    if (isNaN(checkIn) || isNaN(checkOut))
      throw new ApiError(400, "Invalid date format");

    if (checkIn >= checkOut)
      throw new ApiError(400, "checkIn must be before checkOut");

    if (checkIn < dayjs().startOf("day").toDate())
      throw new ApiError(400, "checkIn cannot be in the past");

    // ---------- 2. fetch listing ---------------------
    const listing = await Listing.findById(listingId)
      .select("pricePerNight host availableDates")
      .lean()
      .session(session);

    if (!listing) throw new ApiError(404, "Listing not found");
    if (listing.host.toString() === req.user._id.toString())
      throw new ApiError(403, "You cannot book your own listing");

    // ---------- 3. date‑range fits availability ------
    const fitsRange = listing.availableDates?.some(
      (r) => checkIn >= new Date(r.from) && checkOut <= new Date(r.to)
    );
    if (!fitsRange)
      throw new ApiError(
        400,
        "Requested dates are not within available ranges"
      );

    // ---------- 4. overlapping booking ---------------
    const conflict = await Booking.findOne({
      listing: listingId,
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    }).session(session);

    if (conflict)
      throw new ApiError(400, "Listing already booked for those dates");

    // ---------- 5. compute price ---------------------
    const nights = dayjs(checkOut).diff(dayjs(checkIn), "day");
    const totalPrice = nights * listing.pricePerNight;

    // ---------- 6. create booking --------------------
    const booking = await Booking.create(
      [
        {
          guest: req.user._id,
          listing: listingId,
          checkIn,
          checkOut,
          totalPrice,
          nights,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(new ApiResponse(201, "Booking created", booking[0]));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

export { createBooking };

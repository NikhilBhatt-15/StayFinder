import { Booking } from "../models/booking.model.js";
import { Listing } from "../models/listing.model.js";
import mongoose from "mongoose";
import dayjs from "dayjs";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import crypto from "crypto";

const CLEANING_FEE = 50;
const SERVICE_FEE = 75;
const guestFee = (guests) => {
  if (guests <= 4) return 0;
  if (guests > 4) return (guests - 4) * 1000;
};

const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession(); // for atomicity
  session.startTransaction();

  try {
    // ---------- 1. pull & normalise -----------------
    const {
      listingId,
      startDate,
      endDate,
      guests,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      throw new ApiError(400, "Payment verification failed");
    }
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
    if (nights <= 0) throw new ApiError(400, "Invalid booking duration");
    const totalGuestsFee = guestFee(guests);
    const totalBookingPrice =
      totalPrice + CLEANING_FEE + SERVICE_FEE + totalGuestsFee;

    // ---------- 5.1. validate paid amount -----------
    if (typeof amount !== "number" || amount !== totalBookingPrice) {
      throw new ApiError(
        400,
        `Paid amount (₹${amount}) does not match booking price (₹${totalBookingPrice})`
      );
    }

    // ---------- 5.2. (Optional) Razorpay payment status verification -----------
    // You can add an extra check here by calling Razorpay API to verify payment status.
    // Example (pseudo-code):
    // const payment = await razorpay.payments.fetch(razorpay_payment_id);
    // if (payment.status !== 'captured') throw new ApiError(400, 'Payment not captured');
    // ...existing code...

    // ---------- 6. create booking --------------------
    const booking = await Booking.create(
      [
        {
          guest: req.user._id,
          listing: listingId,
          checkIn,
          checkOut,
          totalPrice: totalBookingPrice,
          nights,
        },
      ],
      { session }
    );

    // ---------- 7. update listing's available dates --
    const updatedAvailableDates = listing.availableDates.filter(
      (r) => !(checkIn >= new Date(r.from) && checkOut <= new Date(r.to))
    );
    await Listing.findByIdAndUpdate(
      listingId,
      { availableDates: updatedAvailableDates },
      { session }
    );

    // ---------- 8. commit transaction ----------------

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

const getOwnBookings = async (req, res, next) => {
  try {
    const listings = await Listing.find({
      host: req.user._id,
    })
      .select("_id")
      .lean();

    const listingIds = listings.map((listing) => listing._id);
    const bookings = await Booking.find({
      listing: { $in: listingIds },
    })
      .populate("guest", "name email")
      .populate("listing", "title address")
      .sort({ createdAt: -1 })
      .lean();

    const resBookings = bookings.map((booking) => {
      return {
        ...booking,
        status: booking.checkOut < new Date() ? "completed" : "upcoming",
      };
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Bookings retrieved", resBookings));
  } catch (error) {
    next(error);
  }
};

const getGuestBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate("listing", "title address")
      .sort({ createdAt: -1 })
      .lean();
    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, "No bookings found for this user"));
    }
    console.log("Bookings:", bookings);
    const resBookings = bookings.map((booking) => {
      return {
        ...booking,
        status: booking.checkOut < new Date() ? "completed" : "upcoming",
      };
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Bookings retrieved", resBookings));
  } catch (error) {
    next(error);
  }
};

const canBook = async (req, res, next) => {
  try {
    const { listingId, startDate, endDate, guests, amount } = req.body;
    if (!listingId || !startDate || !endDate) {
      throw new ApiError(400, "listingId, startDate, endDate are required");
    }
    if (guests > 8) {
      throw new ApiError(400, "guests can't be greater than 8");
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
      .lean();

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

    const conflict = await Booking.findOne({
      listing: listingId,
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    });

    if (conflict)
      throw new ApiError(400, "Listing already booked for those dates");
    const nights = dayjs(checkOut).diff(dayjs(checkIn), "day");
    const totalPrice = nights * listing.pricePerNight;
    if (nights <= 0) throw new ApiError(400, "Invalid booking duration");
    const totalGuestsFee = guestFee(guests);
    const totalBookingPrice =
      totalPrice + CLEANING_FEE + SERVICE_FEE + totalGuestsFee;

    // ---------- 5.1. validate paid amount -----------
    if (typeof amount !== "number" || amount !== totalBookingPrice) {
      throw new ApiError(
        400,
        `Paid amount (₹${amount}) does not match booking price (₹${totalBookingPrice})`
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "You can Book this listing"));
  } catch (error) {
    next(error);
  }
};

export { createBooking, getOwnBookings, getGuestBookings, canBook };

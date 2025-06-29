"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Heart, MapPin, Share, Shield, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import ListingHeader from "./ListingHeader";
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Listing type based on your API
interface Listing {
  _id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  address: string;
  pricePerNight: number;
  images: string[];
  host: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  availableDates: {
    from: string;
    to: string;
    _id: string;
  }[];
  amenities: string[];
  reviews: {
    user: string; // User _id as string
    rating: number;
    comment?: string;
    createdAt?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

export default function ListingDetail() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  const handleBooking = async () => {
    setIsBooking(true);

    if (!checkIn || !checkOut || guests < 1) {
      alert("Please fill in all booking details.");
      setIsBooking(false);
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      alert("Check-out must be after check-in.");
      setIsBooking(false);
      return;
    }
    if (guests < 1 || guests > 8) {
      alert("Guests must be between 1 and 8.");
      setIsBooking(false);
      return;
    }

    const verifyRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/booking/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          listingId: id,
          startDate: checkIn,
          endDate: checkOut,
          guests,
          amount: total,
        }),
      }
    );

    const verify = await verifyRes.json();
    if (verify.status !== 200) {
      alert(verify.message);
      setIsBooking(false);
      return;
    }

    // 1. Load Razorpay SDK
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Failed to load Razorpay SDK. Please try again.");
      setIsBooking(false);
      return;
    }

    // 2. Create Razorpay order on backend
    const orderRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment/order`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: total, currency: "INR" }),
      }
    );
    const orderData = await orderRes.json();
    if (!orderData.order) {
      alert("Failed to create payment order. Please try again.");
      setIsBooking(false);
      return;
    }

    // 3. Open Razorpay checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Set this in your .env.local
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: listing?.title,
      description: "StayFinder Booking",
      order_id: orderData.order.id,
      handler: async function (response: any) {
        // 4. On payment success, create booking
        setIsCreatingBooking(true);
        const bookingRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/booking/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              listingId: id,
              startDate: checkIn,
              endDate: checkOut,
              guests,
              amount: total,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          }
        );
        const bookingData = await bookingRes.json();
        setIsCreatingBooking(false);
        if (bookingData.success) {
          setBookingSuccess(true);
          setIsBooking(false);
        } else {
          alert(bookingData.message || "Booking failed. Please try again.");
          setIsBooking(false);
        }
      },
      modal: {
        ondismiss: function () {
          // Reset booking state when user closes the modal
          setIsBooking(false);
        },
      },
      prefill: {},
      theme: { color: "#6366f1" },
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const saveListing = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/listing/save/${id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to save listing");
      }
      setIsFavorite((prev) => !prev); // Toggle favorite state
    } catch (error) {
      console.error("Error saving listing:", error);
      alert("Failed to save listing. Please try again later.");
    }
  };

  // Calculate number of nights
  let nights = 0;
  if (checkIn && checkOut) {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    nights = Math.max(
      0,
      Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24))
    );
  }

  // Calculate price
  const basePrice = listing ? listing.pricePerNight * nights : 0;
  let extraGuestCharge = 0;
  if (listing && guests > 4) {
    // Example: charge 500 per extra guest per night
    extraGuestCharge = (guests - 4) * 500;
  }
  const cleaningFee = nights > 0 ? 50 : 0;
  const serviceFee = nights > 0 ? 75 : 0;
  const total = basePrice + extraGuestCharge + cleaningFee + serviceFee;

  // Today's date in yyyy-mm-dd for min attribute
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/listing/${id}`) // Change to your actual API endpoint
      .then((res) => res.json())
      .then((data) => {
        setListing(data.data);
        setLoading(false);
      });
  }, [id]);

  // Compute allowed date ranges from availableDates
  let allowedRanges: { from: Date; to: Date }[] = [];
  if (listing) {
    allowedRanges = listing.availableDates.map((d) => ({
      from: new Date(d.from),
      to: new Date(d.to),
    }));
  }

  // Helper to check if a date is in any allowed range
  function isDateAllowed(dateStr: string) {
    const date = new Date(dateStr);
    return allowedRanges.some(
      (range) => date >= range.from && date <= range.to
    );
  }

  // Helper to get min/max for check-in and check-out
  const minCheckIn = allowedRanges.length
    ? allowedRanges[0].from.toISOString().split("T")[0]
    : minDate;
  const maxCheckOut = allowedRanges.length
    ? allowedRanges[allowedRanges.length - 1].to.toISOString().split("T")[0]
    : undefined;

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!listing)
    return <div className="text-center py-20">Listing not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative ">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <ListingHeader />
      <div className="relative z-10 container mx-auto px-19 py-8">
        {/* Title and actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              {listing.title}
            </h1>
            <div className="flex items-center space-x-4 text-slate-600">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-semibold">{5}</span>
                <span className="ml-1">({listing.reviews.length} reviews)</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-indigo-500 mr-1" />
                <span>{listing.address}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => {
                saveListing(listing._id);
              }}
              className="border-slate-300 hover:bg-red-50 hover:border-red-300"
            >
              <Heart
                className={`h-4 w-4 mr-2 ${
                  isFavorite ? "text-red-500 fill-red-500" : "text-slate-600"
                }`}
              />
              Save
            </Button>
            <Button
              variant="outline"
              className="border-slate-300 hover:bg-blue-50 hover:border-blue-300"
            >
              <Share className="h-4 w-4 mr-2 text-blue-600" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image gallery */}
            <div className="animate-scale-in">
              <div className="grid grid-cols-2 gap-4 rounded-2xl overflow-hidden shadow-2xl">
                <div className="col-span-2 md:col-span-1">
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    width={600}
                    height={320}
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="hidden md:grid grid-cols-2 gap-2">
                  {listing.images.slice(1).map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`${listing.title} ${index + 2}`}
                      width={300}
                      height={156}
                      className="w-full h-[156px] object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Host info */}
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={listing.host.avatar}
                      alt={listing.host.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full border-4 border-gradient-to-r from-indigo-400 to-purple-400"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-slate-800">
                          {listing.host.name}
                        </h3>
                        {listing.host && (
                          <Shield className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-slate-600">Host since 2019</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-semibold text-slate-700">
                        Superhost
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {82}% response rate
                    </p>
                    <p className="text-sm text-slate-600">
                      Responds {30} minutes on average
                    </p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  Contact Host
                </Button>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl animate-fade-in">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                  About this place
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl animate-fade-in">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  Amenities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200"
                    >
                      {/* <amenity.icon className="h-6 w-6 text-indigo-600" /> */}
                      <span className="text-slate-700 font-medium">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* House rules */}
            {/* <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl animate-fade-in">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  House Rules
                </h2>
                <ul className="space-y-3">
                  {listing.rules.map((rule, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-3 text-slate-600"
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card> */}
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 backdrop-blur-sm bg-white/90 border-white/20 shadow-2xl animate-scale-in">
              <CardContent className="p-6">
                {isCreatingBooking ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                    <div className="text-xl font-bold text-indigo-700 mb-2">
                      Creating Booking...
                    </div>
                    <div className="text-slate-600 text-center">
                      Please wait while we confirm your reservation.
                    </div>
                  </div>
                ) : bookingSuccess ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <div className="text-3xl mb-4 text-green-600">🎉</div>
                    <div className="text-xl font-bold text-green-700 mb-2">
                      Reservation Confirmed!
                    </div>
                    <div className="text-slate-700 mb-2 text-center">
                      Your booking for{" "}
                      <span className="font-semibold">{listing?.title}</span> is
                      confirmed.
                      <br />
                      Check-in: <span className="font-semibold">{checkIn}</span>
                      <br />
                      Check-out:{" "}
                      <span className="font-semibold">{checkOut}</span>
                      <br />
                      Guests: <span className="font-semibold">{guests}</span>
                    </div>
                    <div className="text-indigo-700 font-bold text-lg mt-2">
                      Total Paid: &#8377;{total}
                    </div>
                    <Button
                      className="mt-6"
                      onClick={() => window.location.reload()}
                    >
                      Book Another Stay
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        &#8377;{listing.pricePerNight}
                      </div>
                      <div className="text-slate-600">per night</div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label
                            htmlFor="checkin"
                            className="text-slate-700 font-medium"
                          >
                            Check-in
                          </Label>
                          <Input
                            id="checkin"
                            type="date"
                            min={minCheckIn}
                            max={maxCheckOut}
                            value={checkIn}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!isDateAllowed(val)) return;
                              setCheckIn(val);
                              // If checkOut is before new checkIn, reset checkOut
                              if (
                                checkOut &&
                                new Date(checkOut) < new Date(val)
                              )
                                setCheckOut("");
                            }}
                            className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-400/20"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="checkout"
                            className="text-slate-700 font-medium"
                          >
                            Check-out
                          </Label>
                          <Input
                            id="checkout"
                            type="date"
                            min={checkIn || minCheckIn}
                            max={maxCheckOut}
                            value={checkOut}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!isDateAllowed(val)) return;
                              setCheckOut(val);
                            }}
                            className="border-slate-300 focus:border-purple-400 focus:ring-purple-400/20"
                          />
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="guests"
                          className="text-slate-700 font-medium"
                        >
                          Guests
                        </Label>
                        <Input
                          id="guests"
                          type="number"
                          min="1"
                          max="8"
                          value={guests}
                          onChange={(e) => setGuests(parseInt(e.target.value))}
                          className="border-slate-300 focus:border-pink-400 focus:ring-pink-400/20"
                        />
                      </div>
                    </div>

                    <div className="mb-2 text-slate-700">
                      Nights: <span className="font-semibold">{nights}</span>
                    </div>
                    {guests > 4 && (
                      <div className="mb-2 text-red-600 text-sm">
                        Extra guest charges applied: &#8377;{extraGuestCharge}
                      </div>
                    )}
                    <div className="mb-2 text-slate-700">
                      Cleaning Fee: &#8377;{cleaningFee}
                    </div>
                    <div className="mb-2 text-slate-700">
                      Service Fee: &#8377;{serviceFee}
                    </div>
                    <div className="text-xl font-bold text-indigo-700 mb-4">
                      Total: &#8377;{total}
                    </div>
                    <Button
                      onClick={handleBooking}
                      className="w-full mb-4 hover-scale bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                      size="lg"
                      disabled={nights === 0 || isBooking}
                    >
                      Reserve Now
                    </Button>

                    <p className="text-center text-sm text-slate-600 mb-4">
                      You won&apos;t be charged yet
                    </p>

                    {/* <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>${listing.pricePerNight} × 5 nights</span>
                    <span>${listing.pricePerNight * 5}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Cleaning fee</span>
                    <span>$50</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Service fee</span>
                    <span>$75</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-slate-800 pt-3 border-t border-slate-200">
                    <span>Total</span>
                    <span>${listing.pricePerNight * 5 + 50 + 75}</span>
                  </div>
                </div> */}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

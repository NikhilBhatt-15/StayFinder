"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Star,
  Heart,
  Bookmark,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const GuestDashboard: React.FC = () => {
  const [likedListings, setLikedListings] = useState<any[]>([]);
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch bookings
        const bookingsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/booking/guest`,
          { credentials: "include" }
        );
        const bookingsData = bookingsRes.ok
          ? await bookingsRes.json()
          : { bookings: [] };
        setBookings(bookingsData.data || []);

        // Fetch liked listings
        const likedRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/listing/liked`,
          { credentials: "include" }
        );
        const likedData = likedRes.ok ? await likedRes.json() : { data: [] };
        setLikedListings(likedData.data || []);

        // Fetch saved listings
        const savedRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/listing/saved`,
          { credentials: "include" }
        );
        const savedData = savedRes.ok ? await savedRes.json() : { data: [] };
        setSavedListings(savedData.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "Upcoming" || booking.status === "upcoming"
  ).length;
  const completedBookings = bookings.filter(
    (booking) =>
      booking.status === "Completed" || booking.status === "completed"
  ).length;

  // Skeletons
  const SkeletonStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse bg-white/80 border-white/20 shadow-xl rounded-lg h-28 flex flex-col justify-center p-4"
        >
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
  const SkeletonTable = () => (
    <div className="animate-pulse bg-white/80 border-white/20 shadow-xl rounded-lg h-48 mt-8 mb-8" />
  );
  const SkeletonListings = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse bg-white/60 border-white/20 rounded-lg h-80 w-full flex flex-col"
        >
          <div className="bg-gray-200 h-48 w-full rounded-t-lg" />
          <div className="p-4 flex-1 flex flex-col gap-2">
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 mt-12 px-8">
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Guest Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Manage your bookings and favorite places
          </p>
        </div>
        {/* Stats Cards */}
        {loading ? (
          <SkeletonStats />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Upcoming Trips
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {upcomingBookings}
                </div>
                <p className="text-xs text-slate-500">Ready for adventure</p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Completed Trips
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {completedBookings}
                </div>
                <p className="text-xs text-slate-500">Great memories made</p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Saved Places
                </CardTitle>
                <Bookmark className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {savedListings.length + likedListings.length}
                </div>
                <p className="text-xs text-slate-500">For future trips</p>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Bookings Section */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">
              Your Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">
                        {booking.propertyTitle || booking.listing?.title}
                      </TableCell>
                      <TableCell>
                        {booking.location || booking.listing?.address}
                      </TableCell>
                      <TableCell>
                        {new Date(booking.checkIn).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(booking.checkOut).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₹{booking.amount || booking.totalPrice}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            booking.status === "Confirmed" ||
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "Upcoming" ||
                                booking.status === "upcoming"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        {/* Liked Listings Section */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              Liked Places
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonListings />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedListings.map((listing) => (
                  <Card
                    key={listing._id}
                    className="group hover-scale backdrop-blur-sm bg-white/60 border-white/20"
                  >
                    <div className="relative">
                      <Image
                        src={listing.images?.[0] || "/placeholder.svg"}
                        alt={listing.title}
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm">
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-slate-800 mb-2">
                        {listing.title}
                      </h3>
                      <div className="flex items-center text-slate-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {listing.address || listing.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-purple-600">
                          ₹{listing.pricePerNight || listing.price}/night
                        </span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-sm text-slate-600">
                            {listing.rating || listing.reviews?.length || 0}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        onClick={() =>
                          (window.location.href = `/listing/${listing._id}`)
                        }
                      >
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Saved Listings Section */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <Bookmark className="h-5 w-5 mr-2 text-purple-600" />
              Saved for Later
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonListings />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedListings.map((listing) => (
                  <Card
                    key={listing._id}
                    className="group hover-scale backdrop-blur-sm bg-white/60 border-white/20"
                  >
                    <div className="relative">
                      <Image
                        src={listing.images?.[0] || "/placeholder.svg"}
                        alt={listing.title}
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm">
                        <Bookmark className="h-4 w-4 text-purple-600 fill-purple-600" />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-slate-800 mb-2">
                        {listing.title}
                      </h3>
                      <div className="flex items-center text-slate-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {listing.address || listing.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-purple-600">
                          ₹{listing.pricePerNight || listing.price}/night
                        </span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-sm text-slate-600">
                            {listing.rating || listing.reviews?.length || 0}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuestDashboard;

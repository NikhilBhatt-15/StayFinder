"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Eye,
  Edit,
  Trash2,
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
import CreateListingModal from "./CreateListingModal";
import EditListingModal from "./EditListingModal";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  status?: "active" | "inactive";
}

interface Booking {
  _id: number;
  listing: {
    _id: string;
    title: string;
    address: string;
  };
  guest: {
    _id: string;
    name: string;
    email: string;
  };
  nights: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  checkIn: string;
  checkOut: string;
  status: "completed" | "upcoming";
}

// Listing Card
const ListingCard: React.FC<{
  listing: Listing;
  onEdit: (listing: Listing) => void;
  onDelete: (listing: Listing) => void;
}> = ({ listing, onEdit, onDelete }) => (
  <Card className=" py-0 group hover:-translate-y-2 hover:shadow-2xl transition-transform duration-300 backdrop-blur-sm bg-white/60 border-white/20">
    <div className="relative">
      <Image
        src={listing.images[0]}
        alt={listing.title}
        width={400}
        height={192}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <div
        className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
          listing.status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {listing.status}
      </div>
    </div>
    <CardContent className="p-4">
      <h3 className="font-bold text-slate-800 mb-2">{listing.title}</h3>
      <div className="flex items-center text-slate-600 mb-2">
        <MapPin className="h-4 w-4 mr-1" />
        <span className="text-sm">{listing.address}</span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-purple-600">
          ${listing.pricePerNight}/night
        </span>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1 text-slate-500" />
          <span className="text-sm text-slate-600">
            {listing.pricePerNight} bookings{" "}
            {/* Assuming bookings is a number */}
          </span>
        </div>
      </div>
      <div className="flex space-x-2">
        <Link
          href={`/host/dashboard/${listing._id}`}
          className="flex-1"
          passHref
        >
          <Button size="sm" variant="outline" className="flex-1 w-full">
            <>
              <Eye className="h-3 w-3 mr-1" />
              View
            </>
          </Button>
        </Link>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => onEdit(listing)}
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 hover:text-red-700"
          onClick={() => onDelete(listing)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Stats Card
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-600">
        {title}
      </CardTitle>
      <span className={color}>{icon}</span>
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </CardContent>
  </Card>
);

// Booking Table
const BookingTable: React.FC<{ bookings: Booking[] }> = ({ bookings }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Property</TableHead>
        <TableHead>Guest</TableHead>
        <TableHead>Check-in</TableHead>
        <TableHead>Check-out</TableHead>
        <TableHead>Amount</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {bookings.map((booking) => (
        <TableRow key={booking._id}>
          <TableCell className="font-medium">{booking.listing.title}</TableCell>
          <TableCell>{booking.guest.name}</TableCell>
          <TableCell>
            {new Date(booking.checkIn).toLocaleDateString()}
          </TableCell>
          <TableCell>
            {new Date(booking.checkOut).toLocaleDateString()}
          </TableCell>
          <TableCell className="font-semibold text-green-600">
            ${booking.totalPrice}
          </TableCell>
          <TableCell>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                booking.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {booking.status}
            </span>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const HostDashboard: React.FC = () => {
  // Mock data for host listings
  const [listings, setListings] = React.useState<Listing[]>([]);

  // Mock data for recent bookings
  const [bookings, setBookings] = React.useState<Booking[]>([]);

  const totalEarnings = bookings?.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0
  );
  const totalBookings = bookings?.length;
  const activeListings = listings.filter(
    (listing) => listing.status === "active"
  ).length;

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingListing, setEditingListing] = React.useState<Listing | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingListing, setDeletingListing] = React.useState<Listing | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  useEffect(() => {
    // Fetch listings and bookings from API
    const fetchData = async () => {
      try {
        const listingsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/listing/own`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Include cookies for session management
          }
        );
        const bookingsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/booking/own`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Include cookies for session management
          }
        );

        const listingRes = await listingsResponse.json();
        const bookingRes = await bookingsResponse.json();
        setListings(listingRes.data || []);
        setBookings(bookingRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deletingListing) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/listing/${deletingListing._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        setListings((prev) =>
          prev.filter((l) => l._id !== deletingListing._id)
        );
        setDeleteDialogOpen(false);
        setDeletingListing(null);
      } else {
        setDeleteError(data.message || "Failed to delete listing.");
      }
    } catch (e) {
      setDeleteError("An error occurred while deleting the listing.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Skeleton components
  const SkeletonCard = () => (
    <div className="animate-pulse bg-white/60 border-white/20 rounded-lg h-80 w-full flex flex-col">
      <div className="bg-gray-200 h-48 w-full rounded-t-lg" />
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
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
    <div className="animate-pulse bg-white/80 border-white/20 shadow-xl rounded-lg h-48 mt-8" />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 mt-11 px-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-10 w-64 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <SkeletonStats />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonTable />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 mt-11 px-8">
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Host Dashboard
            </h1>
            <p className="text-slate-600 text-lg">
              Manage your properties and bookings
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover-scale shadow-lg"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Listing
          </Button>
        </div>
        <CreateListingModal open={modalOpen} onOpenChange={setModalOpen} />
        {editingListing && (
          <EditListingModal
            open={editModalOpen}
            onOpenChange={(open) => {
              setEditModalOpen(open);
              if (!open) setEditingListing(null);
            }}
            listing={editingListing}
          />
        )}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Listing</DialogTitle>
            </DialogHeader>
            <div className="mb-4 text-slate-700">
              Are you sure you want to delete <b>{deletingListing?.title}</b>?
              This action cannot be undone.
            </div>
            {deleteError && (
              <div className="mb-2 p-2 rounded bg-red-100 text-red-700 border border-red-200 text-sm">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Earnings"
            value={`$${totalEarnings?.toLocaleString()}`}
            icon={<DollarSign className="h-4 w-4" />}
            color="text-green-600"
            subtitle="+12% from last month"
          />
          <StatsCard
            title="Active Listings"
            value={activeListings}
            icon={<MapPin className="h-4 w-4" />}
            color="text-blue-600"
            subtitle={`Out of ${listings.length} total`}
          />
          <StatsCard
            title="Total Bookings"
            value={totalBookings || 0}
            icon={<Calendar className="h-4 w-4" />}
            color="text-purple-600"
            subtitle="This month"
          />
        </div>

        {/* Listings Section */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">
              Your Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing._id}
                  listing={listing}
                  onEdit={(l) => {
                    setEditingListing(l);
                    setEditModalOpen(true);
                  }}
                  onDelete={(l) => {
                    setDeletingListing(l);
                    setDeleteDialogOpen(true);
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings Section */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BookingTable bookings={bookings} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostDashboard;

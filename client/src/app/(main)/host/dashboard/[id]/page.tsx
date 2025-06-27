"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Edit, Trash2, Users, Star } from "lucide-react";
import Image from "next/image";
import EditListingModal from "@/components/EditListingModal";

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
    user: string;
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

const HostListingDetailPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchListing = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/listing/${id}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        setListing(data.data);
      } catch (e) {
        console.error("Failed to fetch listing:", e);
        setListing(null);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="w-full max-w-3xl mx-auto animate-pulse">
          <div className="h-64 bg-gray-200 rounded mb-6" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6" />
          <div className="h-10 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20 text-lg text-red-500">
        Listing not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-10 px-4 mt-8">
      <div className="max-w-4xl mx-auto ">
        <Card className="mb-8">
          {/* Image Gallery */}
          <div className="w-full flex gap-3 overflow-x-auto rounded-t-lg mb-4">
            {listing.images.map((img, idx) => (
              <div
                key={idx}
                className="relative h-56 min-w-[320px] rounded-lg overflow-hidden border border-slate-200 bg-white"
              >
                <Image
                  src={img}
                  alt={listing.title + " image " + (idx + 1)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                  style={{ minWidth: 320, minHeight: 224 }}
                />
              </div>
            ))}
          </div>
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2">
              {listing.title}
            </CardTitle>
            <div className="flex items-center text-slate-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {listing.address}, {listing.city}, {listing.country}
              </span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-lg font-bold text-purple-600">
                ${listing.pricePerNight}/night
              </span>
              <span className="flex items-center text-slate-600">
                <Users className="h-4 w-4 mr-1" />
                {listing.reviews.length} reviews
              </span>
              <span className="flex items-center text-yellow-500">
                <Star className="h-4 w-4 mr-1" />
                {listing.reviews.length > 0
                  ? (
                      listing.reviews.reduce((sum, r) => sum + r.rating, 0) /
                      listing.reviews.length
                    ).toFixed(1)
                  : "N/A"}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditModalOpen(true)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-1">Description</h3>
              <p className="text-slate-700">{listing.description}</p>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-1">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((a) => (
                  <span
                    key={a}
                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-1">Available Dates</h3>
              <div className="flex flex-wrap gap-2">
                {listing.availableDates.map((d) => (
                  <span
                    key={d._id}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                  >
                    {new Date(d.from).toLocaleDateString()} -{" "}
                    {new Date(d.to).toLocaleDateString()}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-1">Reviews</h3>
              {listing.reviews.length === 0 ? (
                <p className="text-slate-500">No reviews yet.</p>
              ) : (
                <div className="space-y-2">
                  {listing.reviews.map((r, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">{r.rating}</span>
                        <span className="text-xs text-slate-500">
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <div className="text-slate-700 text-sm">
                        {r.comment || "No comment."}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {listing && (
          <EditListingModal
            open={editModalOpen}
            onOpenChange={(open) => {
              setEditModalOpen(open);
              if (!open) {
                // Optionally refresh listing after edit
                if (id) {
                  setLoading(true);
                  fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/listing/${id}`, {
                    credentials: "include",
                  })
                    .then((res) => res.json())
                    .then((data) => setListing(data.data))
                    .finally(() => setLoading(false));
                }
              }
            }}
            listing={listing}
          />
        )}
      </div>
    </div>
  );
};

export default HostListingDetailPage;

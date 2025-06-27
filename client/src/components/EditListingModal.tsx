"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, MapPin, Home, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MapField from "./MapField";

const amenitiesList = [
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
];

const listingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().min(1, "Address is required"),
  pricePerNight: z.number().min(0, "Price must be positive"),
  coordinates: z.tuple([z.number(), z.number()]),
  amenities: z.array(z.string()).optional(),
  availableFrom: z.date(),
  availableTo: z.date(),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface EditListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing; // Pass the listing object to edit
}

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

const EditListingModal = ({
  open,
  onOpenChange,
  listing,
}: EditListingModalProps) => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    listing.amenities || []
  );
  const [coordinates, setCoordinates] = useState<[number, number] | null>(
    listing.location?.coordinates || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<
    { from: string; to: string; _id?: string }[]
  >(listing.availableDates || []);
  const [newDate, setNewDate] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [dateError] = useState<string | null>(null);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing.title || "",
      description: listing.description || "",
      city: listing.city || "",
      country: listing.country || "",
      address: listing.address || "",
      pricePerNight: listing.pricePerNight || 0,
      coordinates: listing.location?.coordinates || [0, 0],
      amenities: listing.amenities || [],
      availableFrom: listing.availableDates?.[0]?.from
        ? new Date(listing.availableDates[0].from)
        : new Date(),
      availableTo: listing.availableDates?.[0]?.to
        ? new Date(listing.availableDates[0].to)
        : new Date(),
    },
  });

  const onSubmit = (data: ListingFormData) => {
    setIsLoading(true);
    setError(null);
    const updatedListing = {
      ...data,
      location: coordinates || [0, 0],
      amenities: selectedAmenities,
      availableDates,
    };
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/listing/update/${listing._id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedListing),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Listing updated successfully!");
          onOpenChange(false);
        } else {
          setError(data.message || "Failed to update listing.");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setError(
          "An error occurred while updating the listing." + error.message
        );
        setIsLoading(false);
      });
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Add new available date range
  const addAvailableDate = () => {
    setError(null);
    if (newDate.from && newDate.to) {
      const newFrom = new Date(newDate.from);
      const newTo = new Date(newDate.to);
      // Check for overlap with existing ranges
      const isOverlap = availableDates.some((d) => {
        const existingFrom = new Date(d.from);
        const existingTo = new Date(d.to);
        return newFrom <= existingTo && newTo >= existingFrom;
      });
      if (isOverlap) {
        setError("This date range overlaps with an existing range.");
        return;
      }
      setAvailableDates([...availableDates, { ...newDate }]);
      setNewDate({ from: "", to: "" });
    }
  };
  // Remove available date range
  const removeAvailableDate = (idx: number) => {
    setAvailableDates(availableDates.filter((_, i) => i !== idx));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Edit Listing
          </DialogTitle>
        </DialogHeader>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-200 text-sm">
            {error}
          </div>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={`space-y-6 transition-opacity duration-200 ${
              isLoading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Beautiful downtown apartment"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your property..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricePerNight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Night ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="120"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Choose Location on Map</FormLabel>
                <MapField
                  value={coordinates}
                  onChange={(coords) => {
                    setCoordinates(coords);
                    form.setValue("coordinates", coords);
                  }}
                />
                {!coordinates && (
                  <span className="text-xs text-red-500">
                    Please select a location on the map.
                  </span>
                )}
              </div>
            </div>
            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {amenitiesList.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={cn(
                      "p-2 text-sm rounded border transition-colors",
                      selectedAmenities.includes(amenity)
                        ? "bg-purple-100 border-purple-300 text-purple-700"
                        : "bg-white border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
            {/* Available Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Available Dates
              </h3>
              <div className="flex flex-col gap-2">
                {availableDates.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {new Date(d.from).toLocaleDateString()} -{" "}
                      {new Date(d.to).toLocaleDateString()}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAvailableDate(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {dateError && (
                  <span className="text-xs text-red-500">{dateError}</span>
                )}
                <div className="flex gap-2 items-center">
                  <Input
                    type="date"
                    value={newDate.from}
                    onChange={(e) =>
                      setNewDate({ ...newDate, from: e.target.value })
                    }
                    className="max-w-[140px]"
                  />
                  <span>to</span>
                  <Input
                    type="date"
                    value={newDate.to}
                    onChange={(e) =>
                      setNewDate({ ...newDate, to: e.target.value })
                    }
                    className="max-w-[140px]"
                  />
                  <Button type="button" size="sm" onClick={addAvailableDate}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditListingModal;

"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, MapPin, Home, Image as MyImage } from "lucide-react";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import MapField from "./MapField";
import Image from "next/image";

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
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  availableFrom: z.date(),
  availableTo: z.date(),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface CreateListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateListingModal = ({
  open,
  onOpenChange,
}: CreateListingModalProps) => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      city: "",
      country: "",
      address: "",
      pricePerNight: 0,
      coordinates: [0, 0],
      images: [],
      amenities: [],
    },
  });

  const onSubmit = (data: ListingFormData) => {
    setIsLoading(true);
    setError(null);
    const listingData = {
      ...data,
      location: coordinates || [0, 0],
      images: [], // will be handled by file upload
      amenities: selectedAmenities,
      availableDates: [
        {
          from: data.availableFrom,
          to: data.availableTo,
        },
      ],
    };

    const formData = new FormData();
    formData.append("title", listingData.title);
    formData.append("description", listingData.description);
    formData.append("city", listingData.city);
    formData.append("country", listingData.country);
    formData.append("address", listingData.address);
    formData.append("pricePerNight", listingData.pricePerNight.toString());
    formData.append("location", JSON.stringify(coordinates || [0, 0]));
    formData.append("amenities", JSON.stringify(listingData.amenities));
    formData.append(
      "availableDates",
      JSON.stringify(listingData.availableDates)
    );
    // Append image files
    console.log(
      "Form data before images:",
      JSON.stringify(listingData.coordinates)
    );
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/listing/create`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Listing created successfully!");
          onOpenChange(false);
          form.reset();
          setImageFiles([]);
          setSelectedAmenities([]);
          setCoordinates(null);
        } else {
          alert(data.message || "Failed to create listing.");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error creating listing:", error);
        alert("An error occurred while creating the listing.");
        setIsLoading(false);
        setError("An error occurred while creating the listing.");
      });
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create New Listing
          </DialogTitle>
        </DialogHeader>

        {/* Error message */}
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

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <MyImage className="h-5 w-5 mr-2" />
                Images
              </h3>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setImageFiles(Array.from(e.target.files));
                  }
                }}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                disabled={isLoading}
              />
              {imageFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {imageFiles.map((file, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded border"
                      />
                      <span className="text-xs mt-1 truncate w-24">
                        {file.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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

            {/* Availability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Availability
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="availableFrom"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Available From</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availableTo"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Available To</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                {isLoading ? "Creating..." : "Create Listing"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListingModal;

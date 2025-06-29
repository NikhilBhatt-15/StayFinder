"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Calendar, Star, Heart, Filter } from "lucide-react";
// Import your UI components here, or use shadcn/ui if installed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Listing } from "@/types/listing";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function ListingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg bg-white/80 shadow-lg overflow-hidden"
        >
          <div className="w-full h-56 bg-slate-200" />
          <div className="p-4 space-y-3">
            <div className="h-6 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-5 bg-slate-200 rounded w-1/2 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showPricePopover, setShowPricePopover] = useState(false);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const likeListing = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/listing/like/${id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to like listing");
      }
      toggleFavorite(id);
    } catch (error) {
      console.error("Error liking listing:", error);
      alert("Failed to like listing. Please try again later.");
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("location", searchQuery.trim());
      if (checkIn) params.append("checkIn", checkIn);
      if (checkOut) params.append("checkOut", checkOut);
      if (minPrice && Number(minPrice) > 0) params.append("minPrice", minPrice);
      if (maxPrice && Number(maxPrice) > 0) params.append("maxPrice", maxPrice);
      const url = `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/listing/search?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Failed to fetch listings");
      setListings(data.data);
    } catch (error) {
      console.error("Error searching listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/listing/all`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch listings");
        }
        setListings(data.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching listings:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Hero section */}
      <section className="relative z-10 py-20 mt-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 bg-clip-text text-transparent">
              Find Your Perfect
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Stay Anywhere
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto animate-fade-in">
            Discover unique places to stay with local hosts in 191+ countries.
            <span className="text-purple-600 font-semibold">
              Adventure awaits!
            </span>
          </p>

          {/* Search bar */}
          <Card className="max-w-4xl mx-auto animate-scale-in backdrop-blur-sm bg-white/90 shadow-2xl border-white/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
                  <Input
                    placeholder="Where are you going?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 bg-white/50"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500 h-5 w-5" />
                  <Input
                    placeholder="Check-in"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20 bg-white/50"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
                  <Input
                    placeholder="Check-out"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white/50"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-6 gap-4">
                <div className="flex items-center gap-2">
                  <Popover
                    open={showPricePopover}
                    onOpenChange={setShowPricePopover}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-slate-300 text-slate-600 hover:bg-slate-50"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="mb-2 font-semibold text-slate-700">
                        Price Range ($)
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          type="number"
                          min={0}
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-1/2"
                          placeholder="Min"
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          min={0}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-1/2"
                          placeholder="Max"
                        />
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white mt-2"
                        onClick={() => {
                          setShowPricePopover(false);
                          handleSearch();
                        }}
                      >
                        Apply
                      </Button>
                    </PopoverContent>
                  </Popover>
                  <span className="text-sm text-slate-500 ml-2">
                    {minPrice || maxPrice
                      ? `Price: ${minPrice ? `$${minPrice}` : "Any"} - ${
                          maxPrice ? `$${maxPrice}` : "Any"
                        }`
                      : "Price: Any"}
                  </span>
                </div>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 hover-scale shadow-lg"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Listings section */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-15">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Trending Destinations 🔥
              </h2>
              <p className="text-slate-600 text-lg">
                Discover the most popular stays right now
              </p>
            </div>
            <Button
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              View All
            </Button>
          </div>

          {isLoading || !listings ? (
            <div className="container mx-auto px-4 py-8">
              <ListingSkeleton />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center text-lg text-slate-500 py-16">
              No listings found.
              <br />
              <span className="text-slate-400 text-base">
                Try adjusting your search or filters.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((listing) => (
                <Card
                  key={listing._id}
                  className="overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl bg-white/90 pt-0"
                >
                  <div className="relative">
                    <Image
                      width={400}
                      height={300}
                      src={listing.images[0] || "/placeholder.jpg"}
                      alt={listing.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        likeListing(listing._id);
                      }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${
                          favorites.includes(listing._id)
                            ? "text-red-500 fill-red-500"
                            : "text-slate-600 hover:text-red-500"
                        }`}
                      />
                    </button>
                    <div className="absolute bottom-4 left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      &#8377;{listing.pricePerNight}/night
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <Link href={`/listing/${listing._id}`}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors line-clamp-1">
                          {listing.title}
                        </h3>
                        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold text-slate-700">
                            {listing.reviews.reduce(
                              (acc, review) => acc + review.rating,
                              0
                            ) / Math.max(listing.reviews.length, 1)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-slate-600 mb-3">
                        <MapPin className="h-4 w-4 mr-1 text-purple-500" />
                        <span className="text-sm">{listing.address}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          {listing.reviews.length || "0"} reviews • Hosted by{" "}
                          {listing.host.name}
                        </span>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                StayFinder
              </h3>
              <p className="text-slate-300 mb-4">
                Your gateway to extraordinary stays around the world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-300 mb-4">Company</h4>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <Link
                    href="#about"
                    className="hover:text-purple-400 story-link"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#careers"
                    className="hover:text-purple-400 story-link"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#press"
                    className="hover:text-purple-400 story-link"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-pink-300 mb-4">Support</h4>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <Link href="#help" className="hover:text-pink-400 story-link">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#safety"
                    className="hover:text-pink-400 story-link"
                  >
                    Safety
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contact"
                    className="hover:text-pink-400 story-link"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-4">Community</h4>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <Link href="/blog" className="hover:text-blue-400 story-link">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#forum"
                    className="hover:text-blue-400 story-link"
                  >
                    Forum
                  </Link>
                </li>
                <li>
                  <Link
                    href="#events"
                    className="hover:text-blue-400 story-link"
                  >
                    Events
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 StayFinder. Made by Nikhil.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

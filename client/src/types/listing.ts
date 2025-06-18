// types/listing.ts
export type Listing = {
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
};

// User.ts

// User.ts

export type User = {
  _id?: string;
  name: string;
  email: string;
  password?: string; // Usually omitted in responses
  refreshToken?: string;
  phone?: string;
  avatar?: string;
  role: "guest" | "host";
  likedListings?: Listing[];
  savedListings?: Listing[]; // Array of Listing _id strings
  createdAt?: string;
  updatedAt?: string;
};

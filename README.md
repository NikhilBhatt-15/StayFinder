# StayFinder

A modern full-stack web application for booking and hosting unique stays, inspired by Airbnb. Built with Next.js (App Router), React, TypeScript, shadcn/ui, Node.js, Express, and MongoDB.

## Features

- Guest and Host dashboards
- Listing creation, editing, and deletion (with image upload)
- Map-based location picker (OpenStreetMap/Leaflet)
- Dynamic price calculation and extra guest charges
- Booking system with date range validation
- Liked and saved listings
- Protected routes and authentication (JWT, cookies)
- Skeleton loaders and modern UI/UX
- Cloudinary integration for image storage
- Responsive and mobile-friendly design

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, shadcn/ui, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JWT, HttpOnly cookies
- **Image Upload:** Cloudinary
- **Map:** react-leaflet, OpenStreetMap
- **Deployment:** Vercel (frontend), Render (backend)

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas or local MongoDB
- Cloudinary account

### Environment Variables

#### Backend (`server/.env`):

```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=https://your-frontend.vercel.app
```

#### Frontend (`client/.env.local`):

```
NEXT_PUBLIC_BASE_URL=https://your-backend.onrender.com/api
```

### Installation

#### Backend

```bash
cd server
npm install
npm run dev
```

#### Frontend

```bash
cd client
npm install
npm run dev
```

### Deployment

- Frontend: Deploy `client` to Vercel
- Backend: Deploy `server` to Render
- Set environment variables in both platforms

## Folder Structure

```
client/    # Next.js frontend
server/    # Express backend
```

## Credits

- Built by Nikhil
- UI inspired by Airbnb
- Powered by shadcn/ui, Leaflet, Cloudinary, and more

## License

MIT

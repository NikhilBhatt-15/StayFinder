"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-2xl position-fixed absolute top-0 z-50 w-full shadow-lg border-b border-white/80">
      <Link
        href="/"
        className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 bg-clip-text text-transparent hover-scale"
      >
        StayFinder ✈️
      </Link>
      <div className="md:flex items-center space-x-8">
        <Link
          href="/"
          className="text-slate-700 hover:text-purple-600 story-link font-medium transition-colors"
        >
          Home
        </Link>
        <Link
          href="/experiences"
          className="text-slate-700 hover:text-purple-600 story-link font-medium transition-colors"
        >
          Experiences
        </Link>
        {user ? (
          <Link
            href={user?.role === "host" ? "/host/dashboard" : "/dashboard"}
            className="text-slate-700 hover:text-purple-600 story-link font-medium transition-colors"
          >
            Dashboard
          </Link>
        ) : null}
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Avatar className="w-9 h-9 border-2 border-purple-300 shadow">
              <AvatarImage
                src={user.avatar || "/next.svg"}
                alt={user.name || "User"}
              />
              <AvatarFallback>{user.name ? user.name[0] : "U"}</AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
              onClick={logout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover-scale">
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;

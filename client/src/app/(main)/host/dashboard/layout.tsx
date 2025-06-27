"use client";

import { useAuth } from "@/context/AuthContext";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  if (loading) {
    // Optionally show a loading state while fetching user data
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
        <span className="ml-4 text-lg text-gray-700">Loading...</span>
      </div>
    );
  }
  if (!user || user.role !== "host") {
    // Redirect to login if user is not authenticated
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null; // Prevent rendering while redirecting
  }
  return <>{children}</>;
}

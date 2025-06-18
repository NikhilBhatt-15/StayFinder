"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for session management
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false);
        if (data.success) {
          // Handle successful login, e.g., redirect to dashboard
          window.location.href = "/";
        } else {
          // Handle login error, e.g., show a message
          alert(data.message || "Login failed. Please try again.");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Login error:", error);
        alert("An error occurred. Please try again later.");
      });
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-tr from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 py-8 gap-8">
        {/* Branding Side */}
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl h-full min-h-[400px]">
          <Link
            href="/"
            className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg mb-4"
          >
            StayFinder ✈️
          </Link>
          <div className="text-xl md:text-2xl font-semibold text-slate-700 mb-4">
            Welcome back to your next adventure.
          </div>
          <p className="text-base md:text-lg text-slate-500 max-w-md mx-auto">
            Sign in to discover unique stays, connect with local hosts, and
            experience travel like never before.
          </p>
        </div>
        {/* Login Form Side */}
        <div className="flex-1 flex items-center justify-center w-full">
          <Card className="w-full max-w-md max-h-[90vh] shadow-2xl bg-white/90 border border-white/40 rounded-2xl overflow-auto flex flex-col justify-center">
            <CardContent className="p-4 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
                  Sign in to your account
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="transition-all duration-200 focus:scale-[1.02] border-slate-200 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-slate-700 font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pr-10 transition-all duration-200 focus:scale-[1.02] border-slate-200 focus:border-pink-400 focus:ring-pink-400/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pink-500 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full hover-scale bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <p className="text-center text-sm text-slate-600 mt-4">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-indigo-600 hover:text-indigo-700 hover:underline story-link font-medium"
                >
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Login;

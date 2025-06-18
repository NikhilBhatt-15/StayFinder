"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Check, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Card, CardContent } from "@/components/ui/card";

const Register = () => {
  const [formData, setFormData] = useState({
    Name: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const nameElement = useRef<HTMLInputElement>(null);

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "Contains number", met: /\d/.test(formData.password) },
  ];

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    },
    [setFormData]
  );
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    // Focus the name input when the component mounts
    if (nameElement.current) {
      nameElement.current.focus();
      nameElement.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailPattern.test(formData.email);
    if (!isEmailValid) {
      alert("Please enter a valid email address");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    setIsLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.Name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    if (avatarFile) {
      formDataToSend.append("avatar", avatarFile);
    }
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/register`, {
      method: "POST",
      body: formDataToSend,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // navigate to the home page
        window.location.href = "/";
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error during registration:", error);
        alert(error.message || "Registration failed. Please try again.");
      });
    // Simulate API call
    // setTimeout(() => {
    //   setIsLoading(false);
    //   console.log("Registration attempted with:", formData);
    // }, 2000);
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
            Find your next adventure, anywhere in the world.
          </div>
          <p className="text-base md:text-lg text-slate-500 max-w-md mx-auto">
            Discover unique stays, connect with local hosts, and experience
            travel like never before. Join our community and unlock a world of
            possibilities!
          </p>
        </div>
        {/* Signup Form Side */}
        <div className="flex-1 flex items-center justify-center w-full">
          <Card className="w-full max-w-md  shadow-2xl bg-white/90 border border-white/40 rounded-2xl overflow-auto flex flex-col justify-center">
            <CardContent className="p-4 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative group">
                      <Avatar className="w-32 h-32 border-4 border-gradient-to-r from-indigo-200 to-purple-200 shadow-lg transition-all duration-300 group-hover:scale-105">
                        <AvatarImage
                          src={avatarPreview || undefined}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 text-slate-500">
                          <User className="w-12 h-12" />
                        </AvatarFallback>
                      </Avatar>
                      {avatarPreview && (
                        <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="hover-scale border-indigo-200 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {avatarPreview ? "Change Photo" : "Upload Photo"}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Name" className="text-slate-700 font-medium">
                    Name
                  </Label>
                  <Input
                    id="Name"
                    name="Name"
                    ref={nameElement}
                    placeholder="Enter your name"
                    value={formData.Name}
                    onChange={handleChange}
                    required
                    className="transition-all duration-200 focus:scale-[1.02] border-slate-200 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>

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
                      placeholder="Create a password"
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

                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="space-y-2 mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      {passwordRequirements.map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-xs"
                        >
                          <Check
                            className={`h-3 w-3 ${
                              req.met ? "text-green-500" : "text-slate-400"
                            }`}
                          />
                          <span
                            className={
                              req.met
                                ? "text-green-600 font-medium"
                                : "text-slate-500"
                            }
                          >
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-slate-700 font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="pr-10 transition-all duration-200 focus:scale-[1.02] border-slate-200 focus:border-purple-400 focus:ring-purple-400/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-500 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
                        Passwords don&apos;t match
                      </p>
                    )}
                </div>

                <Button
                  type="submit"
                  className="w-full hover-scale bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account ✨"}
                </Button>
              </form>
              {/* 
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500 font-medium">
                    Or sign up with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button
                  variant="outline"
                  className="hover-scale border-slate-200 hover:border-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-slate-700">Google</span>
                </Button>
                <Button
                  variant="outline"
                  className="hover-scale border-slate-200 hover:border-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="#1877F2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-slate-700">Facebook</span>
                </Button>
              </div>
            </div> */}

              <p className="text-center text-sm text-slate-600 mt-4">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-700 hover:underline story-link font-medium"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Register;

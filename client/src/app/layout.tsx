import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StayFinder ✈️",
  description:
    "Find your perfect stay with StayFinder, your go-to platform for unique travel experiences.",
  keywords: [
    "StayFinder",
    "travel",
    "accommodation",
    "host",
    "guest",
    "experiences",
    "booking",
    "vacation rentals",
    "travel platform",
  ],
  authors: [
    {
      name: "StayFinder Team",
      url: "https://stay-finder-two.vercel.app/",
    },
  ],
  creator: "StayFinder Team",
  openGraph: {
    title: "StayFinder ✈️",
    description:
      "Find your perfect stay with StayFinder, your go-to platform for unique travel experiences.",
    url: "https://stay-finder-two.vercel.app/",
    siteName: "StayFinder",
    images: [
      {
        url: "https://stay-finder-two.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "StayFinder - Find your perfect stay",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StayFinder ✈️",
    description:
      "Find your perfect stay with StayFinder, your go-to platform for unique travel experiences.",
    creator: "@stayfinder",
    images: ["https://stay-finder-two.vercel.app/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
    shortcut: "/favicon.png",
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.png",
        color: "#5bbad5",
      },
    ],
  },
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

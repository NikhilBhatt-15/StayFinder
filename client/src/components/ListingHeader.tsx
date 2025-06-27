import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const ListingHeader = () => {
  return (
    <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center text-slate-700 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to listings</span>
        </Link>
      </div>
    </header>
  );
};

export default ListingHeader;

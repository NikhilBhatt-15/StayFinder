// context/AuthContext.tsx
"use client";
import { Listing } from "@/types/listing";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export type User = {
  id: string;
  email: string;
  role: "host" | "guest";
  avatar: string | null;
  name: string;
  likedListings?: Listing[]; // Array of Listing _id strings
  savedListings?: Listing[]; // Array of Listing _id strings
}; // expand as needed
type AuthCtx = {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  setUser: () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    refreshUser();
  }, []);

  /** Call backend /logout then clear context */
  const logout = async () => {
    await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/user/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  /** Re‑fetch /me and update context (used after login or on demand) */
  async function refreshUser() {
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/user/me", {
      credentials: "include",
    });
    if (res.ok) {
      const { data } = await res.json();
      console.log("Refreshed user:", data);
      setUser({
        id: data.user._id,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.avatar || null,
        name: data.user.name || "",
        likedListings: data.user.likedListings || [],
        savedListings: data.user.savedListings || [],
      });
    } else {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Convenience hook */
export const useAuth = () => useContext(AuthContext);

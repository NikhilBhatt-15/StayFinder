// context/AuthContext.tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type User = {
  id: string;
  email: string;
  role: "host" | "guest";
  avatar: string | null;
  name: string;
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

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  useEffect(() => {
    // If initialUser is provided, set it immediately
    if (initialUser) {
      setUser(initialUser);
    } else {
      // Otherwise, fetch the user from /me endpoint
      refreshUser();
    }
  }, [initialUser]);

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

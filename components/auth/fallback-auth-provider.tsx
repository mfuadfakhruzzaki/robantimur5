"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ needsLogin: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FallbackAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    console.log("FallbackAuthProvider - Starting immediately without Supabase");

    // Simulate loading for 1 second then set loading false
    const timeout = setTimeout(() => {
      console.log("FallbackAuthProvider - Setting loading to false");
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("FallbackAuthProvider - Mock sign in:", email);
    // Mock successful login
    throw new Error(
      "Fallback auth provider - please fix Supabase configuration"
    );
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log("FallbackAuthProvider - Mock sign up:", email);
    throw new Error(
      "Fallback auth provider - please fix Supabase configuration"
    );
  };

  const signOut = async () => {
    console.log("FallbackAuthProvider - Mock sign out");
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    console.log("FallbackAuthProvider - Mock update profile");
    throw new Error(
      "Fallback auth provider - please fix Supabase configuration"
    );
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export as AuthProvider alias
export { FallbackAuthProvider as AuthProvider };

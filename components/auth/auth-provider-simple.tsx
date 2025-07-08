"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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

export function SimpleAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Check if user is admin
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initAuth = async () => {
      try {
        console.log("SimpleAuthProvider - Initializing...");

        // Set hard timeout
        initTimeout = setTimeout(() => {
          if (mounted) {
            console.log(
              "SimpleAuthProvider - Timeout reached, setting loading false"
            );
            setLoading(false);
          }
        }, 2000);

        // Get session (simpler than getUser)
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log(
          "SimpleAuthProvider - Session:",
          session?.user?.email || "none"
        );

        if (mounted) {
          setUser(session?.user || null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
          clearTimeout(initTimeout);
          setLoading(false);
        }
      } catch (error) {
        console.error("SimpleAuthProvider - Init error:", error);
        if (mounted) {
          clearTimeout(initTimeout);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "SimpleAuthProvider - Auth state change:",
        event,
        session?.user?.email
      );
      if (mounted) {
        setUser(session?.user || null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("SimpleAuthProvider - Fetching profile for:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Profile fetch failed:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) throw error;

    if (data.user && !data.user.email_confirmed_at) {
      return { needsLogin: true };
    }

    return { needsLogin: false };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error("No user logged in");

    const { error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) throw error;
    await fetchProfile(user.id);
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

// Export AuthProvider as alias
export { SimpleAuthProvider as AuthProvider };

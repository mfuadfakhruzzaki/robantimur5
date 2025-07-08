"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    console.log("LoginPage - user:", user, "loading:", loading);
    setDebugInfo(`User: ${user?.email || "null"}, Loading: ${loading}`);

    // If user is already logged in, redirect to home
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth loading timeout - forcing loading to false");
        setDebugInfo("Auth loading timeout - please refresh page");
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading authentication...</p>
          <p className="text-xs text-gray-500 mt-2">{debugInfo}</p>
        </div>
      </div>
    );
  }

  // If user is logged in, don't show login form (will redirect)
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}

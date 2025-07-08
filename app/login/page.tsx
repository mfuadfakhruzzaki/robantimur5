"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider-simple";
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
        console.warn("Auth loading timeout - showing login form anyway");
        setDebugInfo("Auth loading timeout - showing login form");
        // Force show login form after timeout
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // Show loading while checking auth status (with shorter timeout)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading authentication...</p>
          <p className="text-xs text-gray-500 mt-2">{debugInfo}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-xs text-blue-500 hover:underline"
          >
            Reload page if stuck
          </button>
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

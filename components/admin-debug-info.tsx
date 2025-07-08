"use client";

import { useAuth } from "@/components/auth/auth-provider-simple";

export function AdminDebugInfo() {
  const { user, profile, isAdmin, loading } = useAuth();

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 p-4 rounded shadow-lg text-xs max-w-xs">
      <h4 className="font-bold mb-2">Admin Debug Info</h4>
      <div className="space-y-1">
        <div>Auth Loading: {loading ? "Yes" : "No"}</div>
        <div>User: {user?.email || "None"}</div>
        <div>User ID: {user?.id || "None"}</div>
        <div>Profile: {profile ? "Loaded" : "Not loaded"}</div>
        <div>Profile Role: {profile?.role || "None"}</div>
        <div>Profile Name: {profile?.name || "None"}</div>
        <div>Is Admin: {isAdmin ? "Yes" : "No"}</div>
        <div>
          Profile JSON: {profile ? JSON.stringify(profile, null, 2) : "None"}
        </div>
      </div>
    </div>
  );
}

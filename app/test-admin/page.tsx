"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider-simple";

export default function TestAdminPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const { user, profile, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      testAdminAccess();
    }
  }, [loading, user]);

  const testAdminAccess = async () => {
    const supabase = createClient();
    const results = [];

    try {
      // Test 1: Check current user session
      const { data: session } = await supabase.auth.getSession();
      results.push({
        test: "Current Session",
        result: session.session ? "✅ User logged in" : "❌ No session",
        data: session.session?.user?.email || "No email",
      });

      // Test 2: Check current user profile
      if (user) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        results.push({
          test: "Current User Profile",
          result: profileData ? "✅ Profile found" : "❌ No profile",
          data: profileData || error?.message,
        });
      }

      // Test 3: Check admin users
      const { data: adminUsers, error: adminError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "admin");

      results.push({
        test: "Admin Users",
        result: adminUsers?.length
          ? `✅ ${adminUsers.length} admin(s)`
          : "❌ No admins",
        data: adminUsers || adminError?.message,
      });

      // Test 4: Check if current user is admin
      const isCurrentUserAdmin = profile?.role === "admin";
      results.push({
        test: "Current User Admin Status",
        result: isCurrentUserAdmin ? "✅ Is admin" : "❌ Not admin",
        data: { role: profile?.role, isAdmin },
      });

      // Test 5: Test admin table access
      const { data: adminTest, error: adminAccessError } = await supabase
        .from("profiles")
        .select("count")
        .eq("role", "admin");

      results.push({
        test: "Admin Table Access",
        result: adminAccessError ? "❌ Access denied" : "✅ Access granted",
        data: adminAccessError?.message || "Can query admin data",
      });

      setTestResults(results);
    } catch (error) {
      results.push({
        test: "General Error",
        result: "❌ Error",
        data: error,
      });
      setTestResults(results);
    }
  };

  if (loading) {
    return <div className="p-8">Loading auth...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Access Test</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Auth State</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>User: {user?.email || "Not logged in"}</p>
          <p>Profile Role: {profile?.role || "No role"}</p>
          <p>Is Admin: {isAdmin ? "Yes" : "No"}</p>
          <p>Auth Loading: {loading ? "Yes" : "No"}</p>
        </div>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div key={index} className="border p-4 rounded">
            <h3 className="font-semibold">{result.test}</h3>
            <p className="text-sm text-gray-600 mb-2">{result.result}</p>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={testAdminAccess}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Run Tests Again
        </button>
      </div>
    </div>
  );
}

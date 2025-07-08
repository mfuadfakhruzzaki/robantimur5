"use client";

import React from "react";
import { useSimpleAuth } from "@/components/auth/simple-auth-provider";
import SimpleProtectedRoute from "@/components/auth/simple-protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

function SimpleProfileContent() {
  const { user, signOut } = useSimpleAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Logout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Email:</strong> {user?.email}
              </div>
              <div>
                <strong>User ID:</strong> {user?.id}
              </div>
              <div>
                <strong>Created:</strong>{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SimpleProfilePage() {
  return (
    <SimpleProtectedRoute>
      <SimpleProfileContent />
    </SimpleProtectedRoute>
  );
}

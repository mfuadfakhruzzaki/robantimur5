"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

export default function SimpleDebugInfo() {
  const [isVisible, setIsVisible] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { user, loading } = useAuth();
  const supabase = createClient();

  const testConnection = async () => {
    setTesting(true);
    try {
      const start = Date.now();

      // Test basic connection
      const { data: healthCheck, error: healthError } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      const connectionTime = Date.now() - start;

      setTestResults({
        connectionTime,
        healthCheck: !healthError,
        errors: {
          healthError: healthError?.message,
        },
      });
    } catch (error: any) {
      setTestResults({
        error: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Eye className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-80 overflow-y-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Simple Debug Info</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Auth Status:</strong>
            <Badge variant={user ? "default" : "destructive"} className="ml-1">
              {user ? "Logged In" : "Not Logged In"}
            </Badge>
          </div>
          <div>
            <strong>Loading:</strong>
            <Badge variant={loading ? "secondary" : "default"} className="ml-1">
              {loading ? "Yes" : "No"}
            </Badge>
          </div>
        </div>

        {user && (
          <div className="space-y-1">
            <strong>User Info:</strong>
            <div className="pl-2 space-y-1">
              <div>ID: {user.id}</div>
              <div>Email: {user.email}</div>
              <div>
                Created:{" "}
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={testing}
          >
            {testing ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              "Test Connection"
            )}
          </Button>
        </div>

        {testResults && (
          <div className="space-y-1">
            <strong>Test Results:</strong>
            <div className="pl-2 space-y-1">
              {testResults.error ? (
                <div className="text-red-500">Error: {testResults.error}</div>
              ) : (
                <>
                  <div>Connection: {testResults.connectionTime}ms</div>
                  <div>Health Check: {testResults.healthCheck ? "✓" : "✗"}</div>
                  {testResults.errors.healthError && (
                    <div className="text-red-500">
                      Health Error: {testResults.errors.healthError}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

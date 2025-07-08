"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { testMaterialCRUD, testAuthStatus } from "@/lib/test-crud";
import { Loader2 } from "lucide-react";

export default function TestCRUDPage() {
  const [isTestingCRUD, setIsTestingCRUD] = useState(false);
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [crudResults, setCrudResults] = useState<string[]>([]);
  const [authResults, setAuthResults] = useState<string[]>([]);

  const runCRUDTest = async () => {
    setIsTestingCRUD(true);
    setCrudResults([]);

    // Override console.log to capture output
    const originalLog = console.log;
    const originalError = console.error;
    const results: string[] = [];

    console.log = (...args: any[]) => {
      results.push(args.join(" "));
      originalLog(...args);
    };

    console.error = (...args: any[]) => {
      results.push(`ERROR: ${args.join(" ")}`);
      originalError(...args);
    };

    try {
      await testMaterialCRUD();
    } catch (error) {
      results.push(`EXCEPTION: ${error}`);
    }

    // Restore original console
    console.log = originalLog;
    console.error = originalError;

    setCrudResults(results);
    setIsTestingCRUD(false);
  };

  const runAuthTest = async () => {
    setIsTestingAuth(true);
    setAuthResults([]);

    // Override console.log to capture output
    const originalLog = console.log;
    const results: string[] = [];

    console.log = (...args: any[]) => {
      results.push(args.join(" "));
      originalLog(...args);
    };

    try {
      const authStatus = await testAuthStatus();
      results.push(`Auth Status: ${JSON.stringify(authStatus)}`);
    } catch (error) {
      results.push(`EXCEPTION: ${error}`);
    }

    // Restore original console
    console.log = originalLog;

    setAuthResults(results);
    setIsTestingAuth(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Test CRUD Operations
          </h1>
          <p className="text-gray-600">
            Test the Add, Modify, Delete functionality for materials
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Auth Test */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Test</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={runAuthTest}
                disabled={isTestingAuth}
                className="w-full mb-4"
              >
                {isTestingAuth ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Auth Status"
                )}
              </Button>

              <div className="bg-gray-100 p-4 rounded-md max-h-64 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {authResults.length > 0
                    ? authResults.join("\n")
                    : "No test results yet..."}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* CRUD Test */}
          <Card>
            <CardHeader>
              <CardTitle>CRUD Operations Test</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={runCRUDTest}
                disabled={isTestingCRUD}
                className="w-full mb-4"
              >
                {isTestingCRUD ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test CRUD Operations"
                )}
              </Button>

              <div className="bg-gray-100 p-4 rounded-md max-h-64 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {crudResults.length > 0
                    ? crudResults.join("\n")
                    : "No test results yet..."}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Auth Test:</strong> Checks if user is logged in and has
                admin privileges
              </p>
              <p>
                <strong>CRUD Test:</strong> Tests READ, CREATE, UPDATE, DELETE
                operations on materials
              </p>
              <div className="bg-yellow-50 p-3 rounded-md mt-4">
                <p className="text-yellow-800">
                  <strong>Note:</strong> CREATE, UPDATE, DELETE operations
                  require admin privileges. If you see auth errors, you need to:
                </p>
                <ul className="list-disc ml-4 mt-2 text-yellow-700">
                  <li>Login as an admin user</li>
                  <li>Or create an admin user in the database</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

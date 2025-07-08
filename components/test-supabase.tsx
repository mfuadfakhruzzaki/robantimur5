// Simple test to check Supabase connection
import { createClient } from "@/lib/supabase/client";

export default function TestSupabase() {
  const testConnection = async () => {
    try {
      console.log("Testing Supabase connection...");

      // Check environment variables
      console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log(
        "SUPABASE_ANON_KEY:",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set"
      );

      const supabase = createClient();

      // Test simple query
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      console.log("Connection test result:", { data, error });

      // Test auth
      const { data: authData, error: authError } =
        await supabase.auth.getSession();
      console.log("Auth test result:", {
        session: authData.session?.user?.email || "No session",
        error: authError,
      });
    } catch (error) {
      console.error("Test failed:", error);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={testConnection}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Supabase Connection
      </button>
    </div>
  );
}

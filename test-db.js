import { createClient } from "./lib/supabase/client";

async function testDatabase() {
  console.log("Testing database connection...");
  const supabase = createClient();

  try {
    // Test 1: Basic connection
    console.log("1. Testing basic connection...");
    const { data: healthCheck, error: healthError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (healthError) {
      console.error("❌ Health check failed:", healthError);
      return;
    }
    console.log("✅ Basic connection works");

    // Test 2: Auth session
    console.log("2. Testing auth session...");
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Session check failed:", sessionError);
    } else {
      console.log(
        "✅ Session check works, user:",
        session?.user?.email || "not logged in"
      );
    }

    // Test 3: Tables existence
    console.log("3. Testing table existence...");
    const tables = [
      "profiles",
      "user_stats",
      "activity_log",
      "saved_content",
      "posts",
      "discussion_groups",
      "events",
      "content_materials",
    ];

    for (const table of tables) {
      try {
        const { count } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        console.log(`✅ Table ${table}: ${count} rows`);
      } catch (error) {
        console.error(`❌ Table ${table}: error`, error);
      }
    }
  } catch (error) {
    console.error("❌ Database test failed:", error);
  }
}

// Run the test
testDatabase();

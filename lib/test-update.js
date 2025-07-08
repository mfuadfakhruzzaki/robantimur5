const { createClient } = require("@supabase/supabase-js");

// This is a test file to debug the update issue
// Run this with: node lib/test-update.js

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMaterialUpdate() {
  try {
    console.log("Testing material update...");

    // First, let's check what materials exist
    const { data: materials, error: fetchError } = await supabase
      .from("content_materials")
      .select("*")
      .limit(5);

    if (fetchError) {
      console.error("Error fetching materials:", fetchError);
      return;
    }

    console.log("Existing materials:", materials?.length || 0);

    if (materials && materials.length > 0) {
      const testMaterial = materials[0];
      console.log("Testing update on material:", testMaterial.id);

      // Try to update the material
      const updateData = {
        title: `${testMaterial.title} - Updated at ${new Date().toISOString()}`,
        updated_at: new Date().toISOString(),
      };

      console.log("Update data:", updateData);

      const startTime = Date.now();
      const { data, error } = await supabase
        .from("content_materials")
        .update(updateData)
        .eq("id", testMaterial.id)
        .select();

      const endTime = Date.now();
      console.log(`Update took ${endTime - startTime}ms`);

      if (error) {
        console.error("Update error:", error);
      } else {
        console.log("Update successful:", data);
      }
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

async function testConnection() {
  try {
    console.log("Testing Supabase connection...");

    const { data, error } = await supabase
      .from("content_materials")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Connection error:", error);
    } else {
      console.log("Connection successful");
    }
  } catch (error) {
    console.error("Connection test failed:", error);
  }
}

async function runTests() {
  await testConnection();
  await testMaterialUpdate();
}

runTests();

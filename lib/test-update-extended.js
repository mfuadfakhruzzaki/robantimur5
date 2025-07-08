const { createClient } = require("@supabase/supabase-js");

// Extended test to check why update returns empty array
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdateWithSelect() {
  try {
    console.log("Testing update with different select methods...");

    // Get a material to test with
    const { data: materials, error: fetchError } = await supabase
      .from("content_materials")
      .select("*")
      .limit(1);

    if (fetchError) {
      console.error("Error fetching materials:", fetchError);
      return;
    }

    if (!materials || materials.length === 0) {
      console.log("No materials found");
      return;
    }

    const testMaterial = materials[0];
    console.log("Original material:", testMaterial.title);

    // Test 1: Update without select
    console.log("\n--- Test 1: Update without select ---");
    const updateData1 = {
      title: `${testMaterial.title} - Test 1 at ${new Date().toISOString()}`,
      updated_at: new Date().toISOString(),
    };

    const { data: result1, error: error1 } = await supabase
      .from("content_materials")
      .update(updateData1)
      .eq("id", testMaterial.id);

    console.log("Result 1:", result1);
    console.log("Error 1:", error1);

    // Test 2: Update with select *
    console.log("\n--- Test 2: Update with select * ---");
    const updateData2 = {
      title: `${testMaterial.title} - Test 2 at ${new Date().toISOString()}`,
      updated_at: new Date().toISOString(),
    };

    const { data: result2, error: error2 } = await supabase
      .from("content_materials")
      .update(updateData2)
      .eq("id", testMaterial.id)
      .select("*");

    console.log("Result 2:", result2);
    console.log("Error 2:", error2);

    // Test 3: Update with select specific columns
    console.log("\n--- Test 3: Update with select specific columns ---");
    const updateData3 = {
      title: `${testMaterial.title} - Test 3 at ${new Date().toISOString()}`,
      updated_at: new Date().toISOString(),
    };

    const { data: result3, error: error3 } = await supabase
      .from("content_materials")
      .update(updateData3)
      .eq("id", testMaterial.id)
      .select("id, title, updated_at");

    console.log("Result 3:", result3);
    console.log("Error 3:", error3);

    // Test 4: Check if the record was actually updated
    console.log("\n--- Test 4: Check if record was updated ---");
    const { data: checkData, error: checkError } = await supabase
      .from("content_materials")
      .select("*")
      .eq("id", testMaterial.id);

    console.log("Check result:", checkData);
    console.log("Check error:", checkError);

    // Test 5: Try with service role key
    console.log("\n--- Test 5: Using service role key ---");
    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const updateData5 = {
      title: `${
        testMaterial.title
      } - Test 5 Service Role at ${new Date().toISOString()}`,
      updated_at: new Date().toISOString(),
    };

    const { data: result5, error: error5 } = await supabaseAdmin
      .from("content_materials")
      .update(updateData5)
      .eq("id", testMaterial.id)
      .select("*");

    console.log("Service role result:", result5);
    console.log("Service role error:", error5);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testUpdateWithSelect();

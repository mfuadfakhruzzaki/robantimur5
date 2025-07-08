import { createClient } from "@/lib/supabase/client";

// Test script for material CRUD operations
export const testMaterialCRUD = async () => {
  const supabase = createClient();

  console.log("🔄 Testing Material CRUD Operations...");

  try {
    // 1. Test READ - Get all materials
    console.log("📖 Testing READ operation...");
    const { data: materials, error: readError } = await supabase
      .from("content_materials")
      .select("*")
      .limit(5);

    if (readError) {
      console.error("❌ READ Error:", readError);
      return false;
    }

    console.log("✅ READ Success:", materials?.length || 0, "materials found");

    // 2. Test CREATE - Add new material (only if admin)
    console.log("➕ Testing CREATE operation...");
    const testMaterial = {
      slug: `test-material-${Date.now()}`,
      title: "Test Material",
      description: "This is a test material",
      content: "<p>Test content</p>",
      category: "gizi",
      read_time: "3 menit",
      topics: ["Test Topic 1", "Test Topic 2"],
      is_published: false,
    };

    const { data: newMaterial, error: createError } = await supabase
      .from("content_materials")
      .insert(testMaterial)
      .select()
      .single();

    if (createError) {
      console.log(
        "⚠️  CREATE Error (might be auth issue):",
        createError.message
      );
    } else {
      console.log("✅ CREATE Success:", newMaterial?.title);

      // 3. Test UPDATE if create was successful
      if (newMaterial) {
        console.log("✏️  Testing UPDATE operation...");
        const { error: updateError } = await supabase
          .from("content_materials")
          .update({ title: "Updated Test Material" })
          .eq("id", newMaterial.id);

        if (updateError) {
          console.log("⚠️  UPDATE Error:", updateError.message);
        } else {
          console.log("✅ UPDATE Success");
        }

        // 4. Test DELETE
        console.log("🗑️  Testing DELETE operation...");
        const { error: deleteError } = await supabase
          .from("content_materials")
          .delete()
          .eq("id", newMaterial.id);

        if (deleteError) {
          console.log("⚠️  DELETE Error:", deleteError.message);
        } else {
          console.log("✅ DELETE Success");
        }
      }
    }

    return true;
  } catch (error) {
    console.error("❌ General Error:", error);
    return false;
  }
};

// Test auth status
export const testAuthStatus = async () => {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    console.log("👤 User logged in:", session.user.email);

    // Get profile to check admin status
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    console.log("🔑 User role:", profile?.role || "user");
    return { isLoggedIn: true, isAdmin: profile?.role === "admin" };
  } else {
    console.log("🚫 No user logged in");
    return { isLoggedIn: false, isAdmin: false };
  }
};

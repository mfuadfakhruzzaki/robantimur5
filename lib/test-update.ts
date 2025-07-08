import { createClient } from "@supabase/supabase-js";

// This is a test file to debug the update issue
// Run this with: npx ts-node lib/test-update.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

    console.log("Existing materials:", materials);

    if (materials && materials.length > 0) {
      const testMaterial = materials[0];
      console.log("Testing update on material:", testMaterial.id);

      // Try to update the material
      const updateData = {
        title: `${testMaterial.title} - Updated at ${new Date().toISOString()}`,
        updated_at: new Date().toISOString(),
      };

      console.log("Update data:", updateData);

      const { data, error } = await supabase
        .from("content_materials")
        .update(updateData)
        .eq("id", testMaterial.id)
        .select();

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

async function testVideoUpdate() {
  try {
    console.log("Testing video update...");

    // First, let's check what videos exist
    const { data: videos, error: fetchError } = await supabase
      .from("educational_videos")
      .select("*")
      .limit(5);

    if (fetchError) {
      console.error("Error fetching videos:", fetchError);
      return;
    }

    console.log("Existing videos:", videos);

    if (videos && videos.length > 0) {
      const testVideo = videos[0];
      console.log("Testing update on video:", testVideo.id);

      // Try to update the video
      const updateData = {
        title: `${testVideo.title} - Updated at ${new Date().toISOString()}`,
        updated_at: new Date().toISOString(),
      };

      console.log("Update data:", updateData);

      const { data, error } = await supabase
        .from("educational_videos")
        .update(updateData)
        .eq("id", testVideo.id)
        .select();

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

async function runTests() {
  await testMaterialUpdate();
  await testVideoUpdate();
}

runTests();

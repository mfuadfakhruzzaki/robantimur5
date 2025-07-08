-- EXTREME: Disable RLS completely for testing
-- WARNING: This removes all security! Only use for testing!
-- Run this in your Supabase SQL editor

-- 1. Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read all content_materials" ON content_materials;
DROP POLICY IF EXISTS "Allow users to insert content_materials" ON content_materials;
DROP POLICY IF EXISTS "Allow users to update content_materials" ON content_materials;
DROP POLICY IF EXISTS "Allow users to delete content_materials" ON content_materials;
DROP POLICY IF EXISTS "content_materials_select_policy" ON content_materials;
DROP POLICY IF EXISTS "content_materials_insert_policy" ON content_materials;
DROP POLICY IF EXISTS "content_materials_update_policy" ON content_materials;
DROP POLICY IF EXISTS "content_materials_delete_policy" ON content_materials;
DROP POLICY IF EXISTS "allow_all_authenticated_content_materials" ON content_materials;

DROP POLICY IF EXISTS "Allow authenticated users to read all educational_videos" ON educational_videos;
DROP POLICY IF EXISTS "Allow users to insert educational_videos" ON educational_videos;
DROP POLICY IF EXISTS "Allow users to update educational_videos" ON educational_videos;
DROP POLICY IF EXISTS "Allow users to delete educational_videos" ON educational_videos;
DROP POLICY IF EXISTS "educational_videos_select_policy" ON educational_videos;
DROP POLICY IF EXISTS "educational_videos_insert_policy" ON educational_videos;
DROP POLICY IF EXISTS "educational_videos_update_policy" ON educational_videos;
DROP POLICY IF EXISTS "educational_videos_delete_policy" ON educational_videos;
DROP POLICY IF EXISTS "allow_all_authenticated_educational_videos" ON educational_videos;

DROP POLICY IF EXISTS "Allow users to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "allow_all_authenticated_profiles" ON profiles;

-- 2. Disable RLS completely
ALTER TABLE content_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE educational_videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Verify RLS is disabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity, 
    forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('content_materials', 'educational_videos', 'profiles');

-- 4. Test update without RLS
UPDATE content_materials 
SET title = 'Test Update Without RLS at ' || NOW()
WHERE id = (SELECT id FROM content_materials LIMIT 1)
RETURNING id, title, updated_at;

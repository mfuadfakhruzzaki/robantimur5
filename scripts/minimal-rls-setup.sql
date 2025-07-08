-- Script untuk mengatur RLS seminimal mungkin
-- Run this in your Supabase SQL editor

-- 1. Drop all existing RLS policies first
DROP POLICY IF EXISTS "Allow authenticated users to read all content_materials" ON content_materials;
DROP POLICY IF EXISTS "Allow users to insert content_materials" ON content_materials;
DROP POLICY IF EXISTS "Allow users to update content_materials" ON content_materials;
DROP POLICY IF EXISTS "Allow users to delete content_materials" ON content_materials;
DROP POLICY IF EXISTS "content_materials_select_policy" ON content_materials;
DROP POLICY IF EXISTS "content_materials_insert_policy" ON content_materials;
DROP POLICY IF EXISTS "content_materials_update_policy" ON content_materials;
DROP POLICY IF EXISTS "content_materials_delete_policy" ON content_materials;

DROP POLICY IF EXISTS "Allow authenticated users to read all educational_videos" ON educational_videos;
DROP POLICY IF EXISTS "Allow users to insert educational_videos" ON educational_videos;
DROP POLICY IF EXISTS "Allow users to update educational_videos" ON educational_videos;
DROP POLICY IF EXISTS "Allow users to delete educational_videos" ON educational_videos;
DROP POLICY IF EXISTS "educational_videos_select_policy" ON educational_videos;
DROP POLICY IF EXISTS "educational_videos_insert_policy" ON educational_videos;
DROP POLICY IF EXISTS "educational_videos_update_policy" ON educational_videos;
DROP POLICY IF EXISTS "educational_videos_delete_policy" ON educational_videos;

DROP POLICY IF EXISTS "Allow users to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- 2. Create super simple policies - allow authenticated users to do everything
CREATE POLICY "allow_all_authenticated_content_materials" ON content_materials
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_authenticated_educational_videos" ON educational_videos
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_authenticated_profiles" ON profiles
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Make sure RLS is enabled
ALTER TABLE content_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Verify policies are created
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename IN ('content_materials', 'educational_videos', 'profiles')
ORDER BY tablename, policyname;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- 3. Create minimal RLS policies - sangat permisif
-- Enable RLS back
ALTER TABLE content_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Content Materials - Allow all operations for authenticated users
CREATE POLICY "content_materials_all_access" ON content_materials
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Educational Videos - Allow all operations for authenticated users
CREATE POLICY "educational_videos_all_access" ON educational_videos
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Profiles - Allow all operations for authenticated users
CREATE POLICY "profiles_all_access" ON profiles
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Also allow anonymous read access to published content
CREATE POLICY "content_materials_anonymous_read" ON content_materials
    FOR SELECT 
    TO anon
    USING (is_published = true);

CREATE POLICY "educational_videos_anonymous_read" ON educational_videos
    FOR SELECT 
    TO anon
    USING (true);

-- 5. Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('content_materials', 'educational_videos', 'profiles')
ORDER BY tablename, policyname;

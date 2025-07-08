-- Test script untuk memastikan RLS bekerja dengan baik
-- Run this in your Supabase SQL editor setelah menjalankan minimal-rls-setup.sql

-- 1. Test current user dan role
SELECT 
    auth.uid() as user_id,
    auth.email() as user_email,
    auth.role() as auth_role,
    (SELECT role FROM profiles WHERE id = auth.uid()) as profile_role;

-- 2. Test select content_materials
SELECT id, title, is_published, created_by 
FROM content_materials 
LIMIT 3;

-- 3. Test update content_materials
UPDATE content_materials 
SET title = title || ' (Updated ' || NOW() || ')'
WHERE id = (SELECT id FROM content_materials LIMIT 1);

-- 4. Test select educational_videos
SELECT id, title, created_by 
FROM educational_videos 
LIMIT 3;

-- 5. Test update educational_videos
UPDATE educational_videos 
SET title = title || ' (Updated ' || NOW() || ')'
WHERE id = (SELECT id FROM educational_videos LIMIT 1);

-- 6. Test select profiles
SELECT id, role, full_name 
FROM profiles 
LIMIT 3;

-- 7. Test update profiles
UPDATE profiles 
SET full_name = COALESCE(full_name, '') || ' (Updated ' || NOW() || ')'
WHERE id = auth.uid();

-- 8. Check if operations completed successfully
SELECT 'Content Materials' as table_name, COUNT(*) as count FROM content_materials
UNION ALL
SELECT 'Educational Videos', COUNT(*) FROM educational_videos
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles;

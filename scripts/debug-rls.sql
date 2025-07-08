-- Test RLS policies for content_materials and educational_videos
-- Run this in your Supabase SQL editor

-- Check RLS policies for content_materials
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'content_materials';

-- Check RLS policies for educational_videos
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'educational_videos';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('content_materials', 'educational_videos');

-- Test if admin user can update content_materials
SELECT 
  current_user,
  (SELECT role FROM profiles WHERE id = auth.uid()) as current_role,
  auth.uid() as user_id;

-- Test update as admin user (replace with actual material ID)
-- UPDATE content_materials 
-- SET title = 'Test Update ' || NOW()
-- WHERE id = 'your-material-id-here';

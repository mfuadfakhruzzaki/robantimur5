-- Test RLS policies for content_materials table
-- Run this in Supabase SQL Editor to check if admin can create materials

-- 1. Check current user and role
SELECT 
  auth.uid() as current_user_id,
  p.email,
  p.role
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.id = auth.uid();

-- 2. Check if RLS is enabled on content_materials
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'content_materials';

-- 3. Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'content_materials';

-- 4. Test if current user can insert (should work if admin)
-- This is just a test query, don't actually run the INSERT
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    ) 
    THEN 'User has admin access - can insert'
    ELSE 'User does not have admin access - cannot insert'
  END as access_status;

-- 5. Check if there are any existing materials to test read access
SELECT 
  COUNT(*) as total_materials,
  COUNT(CASE WHEN is_published = true THEN 1 END) as published_materials
FROM public.content_materials;

-- Create admin user if not exists
-- Run this script in Supabase SQL Editor

-- First, create the user in auth.users (this is typically done through the auth system)
-- But we can update an existing user to admin

-- Update user role to admin (replace 'your-user-email@example.com' with actual email)
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@roban.com'  -- Change this to your email
);

-- If no user exists with that email, you can create a profile manually
-- after creating the user through normal signup process

-- Check current admin users
SELECT 
  u.email, 
  p.name, 
  p.role 
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE p.role = 'admin';

-- Alternative: Make any existing user admin (use carefully!)
-- UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM public.profiles LIMIT 1);

-- Script to make a user admin
-- Replace 'your-email@example.com' with the actual email address

-- Example usage:
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id IN (
--   SELECT id FROM auth.users WHERE email = 'your-email@example.com'
-- );

-- Or use the function:
-- SELECT public.make_user_admin('your-email@example.com');

-- To check current users:
SELECT 
  u.email,
  p.name,
  p.role,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

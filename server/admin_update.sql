-- Add role column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Update YOUR user to be an admin
-- Replace 'abiolaquadri111@gmail.com' with the email you signed up with if different
UPDATE public.profiles
SET role = 'admin'
FROM auth.users
WHERE public.profiles.id = auth.users.id
AND auth.users.email = 'abiolaquadri111@gmail.com';

-- Verify the update
SELECT * FROM public.profiles WHERE role = 'admin';

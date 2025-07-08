-- This script should be run after you have at least one user registered
-- Replace 'your-user-email@example.com' with an actual user email from your auth.users table

DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    -- Get the first user from auth.users table
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- Only insert events if we have a user
    IF sample_user_id IS NOT NULL THEN
        INSERT INTO public.events (title, description, event_date, event_time, location, event_type, max_attendees, created_by) VALUES
        ('Posyandu Melati', 'Pemeriksaan kesehatan rutin untuk balita dan ibu', '2024-02-15', '08:00 - 12:00', 'Balai Desa Roban Timur', 'posyandu', 50, sample_user_id),
        ('Penyuluhan Gizi Balita', 'Edukasi tentang nutrisi yang tepat untuk balita', '2024-02-18', '09:00 - 11:00', 'Puskesmas Roban', 'edukasi', 30, sample_user_id),
        ('Senam Sehat Ibu-Ibu', 'Olahraga bersama untuk menjaga kesehatan', '2024-02-20', '06:00 - 07:00', 'Lapangan Desa', 'olahraga', 100, sample_user_id);
        
        RAISE NOTICE 'Sample events created successfully with user ID: %', sample_user_id;
    ELSE
        RAISE NOTICE 'No users found. Please register a user first, then run this script again.';
    END IF;
END $$;

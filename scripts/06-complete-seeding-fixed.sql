-- Complete database seeding script (Fixed)
-- This script ensures all necessary initial data is populated

-- First, ensure we have the admin role capability
DO $$
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- Insert badges if they don't exist
INSERT INTO public.badges (name, description, icon, points_required) 
SELECT * FROM (VALUES
    ('Pembaca Pertama', 'Membaca artikel pertama', '📚', 0),
    ('Master Chatbot', 'Bertanya 10 kali ke AI', '🤖', 300),
    ('Penolong Komunitas', 'Membantu 5 ibu lain di forum', '🤝', 500),
    ('Streak Kesehatan', 'Login 7 hari berturut-turut', '🔥', 350),
    ('Juara Kuis', 'Menyelesaikan 5 kuis dengan sempurna', '🏆', 750),
    ('Berbagi Resep', 'Membagikan 3 resep sehat', '👩‍🍳', 450),
    ('Ahli Gizi', 'Membaca semua artikel gizi', '🥗', 1000),
    ('Dokter Gigi Kecil', 'Menguasai semua materi kesehatan gigi', '🦷', 1000),
    ('Sanitasi Expert', 'Ahli dalam sanitasi keluarga', '🧽', 1000),
    ('Komunitas Star', 'Mendapat 100 likes di postingan', '⭐', 2000),
    ('Konsultan AI', 'Bertanya 50 kali ke AI', '🧠', 1500),
    ('Penulis Handal', 'Menulis 10 postingan di komunitas', '✍️', 800),
    ('Inspirator', 'Berbagi 5 cerita sukses', '💡', 600),
    ('Event Organizer', 'Membuat 3 acara komunitas', '📅', 900)
) AS v(name, description, icon, points_required)
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE badges.name = v.name);

-- Insert discussion groups if they don't exist
INSERT INTO public.discussion_groups (name, description, category) 
SELECT * FROM (VALUES
    ('Gizi Balita', 'Diskusi seputar nutrisi dan makanan untuk balita', 'gizi'),
    ('Kesehatan Gigi Keluarga', 'Tips dan trik merawat gigi seluruh anggota keluarga', 'gigi'),
    ('Sanitasi & Kebersihan', 'Berbagi tips menjaga kebersihan rumah dan lingkungan', 'sanitasi'),
    ('Ibu Hamil Sehat', 'Diskusi khusus untuk ibu hamil dan persiapan melahirkan', 'kehamilan'),
    ('Resep Sehat Keluarga', 'Berbagi resep makanan sehat dan bergizi', 'resep'),
    ('MPASI & Makanan Bayi', 'Panduan lengkap MPASI dan makanan untuk bayi', 'gizi'),
    ('Tumbuh Kembang Anak', 'Diskusi perkembangan fisik dan mental anak', 'kesehatan'),
    ('Tips Parenting Sehat', 'Berbagi pengalaman mengasuh anak dengan sehat', 'parenting'),
    ('Olahraga Keluarga', 'Aktivitas fisik dan olahraga untuk seluruh keluarga', 'olahraga'),
    ('Kesehatan Mental Ibu', 'Dukungan dan tips menjaga kesehatan mental ibu', 'mental')
) AS v(name, description, category)
WHERE NOT EXISTS (SELECT 1 FROM public.discussion_groups WHERE discussion_groups.name = v.name);

-- Insert daily challenges if they don't exist
INSERT INTO public.daily_challenges (title, description, points, challenge_type, icon) 
SELECT * FROM (VALUES
    ('Baca 1 Artikel Kesehatan', 'Baca artikel tentang gizi, kesehatan gigi, atau sanitasi', 50, 'read_article', '📖'),
    ('Tanya AI Tentang Kesehatan', 'Ajukan pertanyaan kepada asisten AI', 30, 'ask_ai', '🤖'),
    ('Berpartisipasi di Komunitas', 'Posting atau komentar di forum komunitas', 75, 'community_post', '💬'),
    ('Bagikan Tips Kesehatan', 'Bagikan tips kesehatan di media sosial', 100, 'health_tip', '💡'),
    ('Selesaikan Kuis Harian', 'Jawab kuis kesehatan dengan benar', 60, 'daily_quiz', '🧠'),
    ('Cuci Tangan 6 Langkah', 'Praktikkan cuci tangan 6 langkah WHO', 40, 'hygiene_practice', '🧼'),
    ('Sikat Gigi 2x Sehari', 'Sikat gigi pagi dan malam dengan benar', 35, 'dental_care', '🦷'),
    ('Minum 8 Gelas Air', 'Konsumsi air putih minimal 8 gelas hari ini', 25, 'hydration', '💧'),
    ('Olahraga 30 Menit', 'Lakukan aktivitas fisik minimal 30 menit', 80, 'exercise', '🏃‍♀️'),
    ('Konsumsi 5 Porsi Buah/Sayur', 'Makan buah dan sayuran minimal 5 porsi', 70, 'nutrition', '🥬')
) AS v(title, description, points, challenge_type, icon)
WHERE NOT EXISTS (SELECT 1 FROM public.daily_challenges WHERE daily_challenges.title = v.title);

-- Create function to initialize user data
CREATE OR REPLACE FUNCTION public.initialize_new_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  
  -- Create user stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  -- Award first badge
  INSERT INTO public.user_badges (user_id, badge_id)
  SELECT NEW.id, id FROM public.badges WHERE name = 'Pembaca Pertama'
  ON CONFLICT (user_id, badge_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_new_user_data();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON public.posts(group_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_content_materials_category ON public.content_materials(category);
CREATE INDEX IF NOT EXISTS idx_content_materials_published ON public.content_materials(is_published);

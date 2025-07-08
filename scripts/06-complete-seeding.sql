-- Complete database seeding script
-- This script ensures all necessary initial data is populated

-- First, ensure we have the admin role capability
DO $$
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- Clear existing data to avoid conflicts (optional - remove if you want to keep existing data)
-- TRUNCATE TABLE public.badges CASCADE;
-- TRUNCATE TABLE public.discussion_groups CASCADE;
-- TRUNCATE TABLE public.daily_challenges CASCADE;

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

-- Insert sample content materials if they don't exist
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the first user to use as content creator (or create a system user)
    SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert content materials
        INSERT INTO public.content_materials (slug, title, description, content, category, read_time, topics, created_by) 
        SELECT * FROM (VALUES
            ('gizi-keluarga', 'Gizi Keluarga', 'Panduan lengkap nutrisi seimbang untuk seluruh anggota keluarga', 
             '# Gizi Keluarga: Panduan Nutrisi Seimbang

## Mengapa Gizi Keluarga Penting?

Gizi yang baik adalah fondasi kesehatan keluarga. Dengan memberikan makanan bergizi seimbang, kita membantu anggota keluarga tumbuh sehat, memiliki daya tahan tubuh yang kuat, dan terhindar dari berbagai penyakit.

## Menu 4 Sehat 5 Sempurna

### 1. Makanan Pokok
- **Nasi, jagung, ubi, atau roti** sebagai sumber karbohidrat
- Berikan porsi secukupnya, tidak berlebihan
- Variasikan jenis makanan pokok agar tidak bosan

### 2. Lauk Pauk
- **Protein hewani**: telur, ikan, ayam, daging
- **Protein nabati**: tahu, tempe, kacang-kacangan
- Minimal 1 porsi protein setiap makan

### 3. Sayur-sayuran
- **Sayuran hijau**: bayam, kangkung, sawi
- **Sayuran berwarna**: wortel, tomat, terong
- Minimal 2-3 porsi sayur setiap hari

### 4. Buah-buahan
- **Buah lokal**: pisang, pepaya, jeruk
- **Buah musiman**: mangga, rambutan, salak
- 2-3 porsi buah setiap hari

### 5. Susu (Penyempurna)
- Susu sapi, susu kedelai, atau yogurt
- Terutama penting untuk anak-anak dan ibu hamil

*Ingat, Bu: Gizi seimbang bukan berarti mahal. Yang penting variasi makanan dan porsi yang tepat untuk setiap anggota keluarga.*', 
             'gizi', '5 menit', ARRAY['Menu 4 Sehat 5 Sempurna', 'Gizi Balita', 'Makanan Bergizi Murah'], admin_user_id),
            
            ('kesehatan-gigi', 'Kesehatan Gigi', 'Tips merawat kesehatan gigi dan mulut untuk keluarga',
             '# Kesehatan Gigi: Panduan Merawat Gigi Keluarga

## Mengapa Kesehatan Gigi Penting?

Gigi yang sehat bukan hanya untuk penampilan, tapi juga untuk kesehatan tubuh secara keseluruhan. Gigi yang bermasalah dapat menyebabkan infeksi yang menyebar ke organ lain.

## Cara Sikat Gigi yang Benar

### Langkah-langkah Menyikat Gigi

1. **Gunakan pasta gigi berfluoride** sebesar biji jagung
2. **Sikat dengan gerakan memutar** dari gusi ke ujung gigi
3. **Sikat semua permukaan gigi**: depan, belakang, dan atas
4. **Sikat lidah** untuk menghilangkan bakteri
5. **Berkumur dengan air bersih**

### Waktu yang Tepat
- **Pagi hari** setelah sarapan
- **Malam hari** sebelum tidur
- **Setelah makan manis** (jika memungkinkan)

*Ingat, Bu: Mencegah lebih baik daripada mengobati. Biasakan keluarga merawat gigi sejak dini untuk kesehatan yang optimal.*',
             'gigi', '4 menit', ARRAY['Cara Sikat Gigi yang Benar', 'Perawatan Gigi Anak', 'Mencegah Gigi Berlubang'], admin_user_id),
            
            ('sanitasi-keluarga', 'Sanitasi Keluarga', 'Menjaga kebersihan rumah dan lingkungan untuk kesehatan keluarga',
             '# Sanitasi Keluarga: Menjaga Kebersihan untuk Kesehatan

## Mengapa Sanitasi Penting?

Sanitasi yang baik adalah kunci utama mencegah penyakit menular. Dengan menjaga kebersihan rumah dan lingkungan, kita melindungi keluarga dari berbagai penyakit seperti diare, demam berdarah, dan infeksi lainnya.

## Cuci Tangan yang Benar

### 6 Langkah Cuci Tangan WHO

1. **Basahi tangan** dengan air mengalir
2. **Sabuni telapak tangan** dan gosok merata
3. **Gosok punggung tangan** kiri dan kanan bergantian
4. **Gosok sela-sela jari** dengan menjalin jari
5. **Gosok ujung jari** ke telapak tangan
6. **Gosok ibu jari** dengan gerakan memutar

### Kapan Harus Cuci Tangan?
- **Sebelum makan** dan menyiapkan makanan
- **Setelah dari toilet** atau mengganti popok
- **Setelah menyentuh hewan** atau sampah
- **Sebelum menyusui** atau menyentuh bayi
- **Setelah batuk atau bersin**

*Ingat, Bu: Sanitasi yang baik dimulai dari kebiasaan kecil sehari-hari. Libatkan seluruh anggota keluarga untuk menjaga kebersihan bersama-sama.*',
             'sanitasi', '6 menit', ARRAY['Cuci Tangan yang Benar', 'Kebersihan Dapur', 'Pengelolaan Sampah'], admin_user_id)
        ) AS v(slug, title, description, content, category, read_time, topics, created_by)
        WHERE NOT EXISTS (SELECT 1 FROM public.content_materials WHERE content_materials.slug = v.slug);
        
        RAISE NOTICE 'Sample content materials created successfully';
    ELSE
        RAISE NOTICE 'No users found. Content materials will be created after user registration.';
    END IF;
END $$;

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

RAISE NOTICE 'Database seeding completed successfully!';

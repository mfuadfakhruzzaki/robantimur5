-- Insert default badges
INSERT INTO public.badges (name, description, icon, points_required) VALUES
('Pembaca Pertama', 'Membaca artikel pertama', '📚', 0),
('Master Chatbot', 'Bertanya 10 kali ke AI', '🤖', 300),
('Penolong Komunitas', 'Membantu 5 ibu lain di forum', '🤝', 500),
('Streak Kesehatan', 'Login 7 hari berturut-turut', '🔥', 350),
('Juara Kuis', 'Menyelesaikan 5 kuis dengan sempurna', '🏆', 750),
('Berbagi Resep', 'Membagikan 3 resep sehat', '👩‍🍳', 450),
('Ahli Gizi', 'Membaca semua artikel gizi', '🥗', 1000),
('Dokter Gigi Kecil', 'Menguasai semua materi kesehatan gigi', '🦷', 1000),
('Sanitasi Expert', 'Ahli dalam sanitasi keluarga', '🧽', 1000),
('Komunitas Star', 'Mendapat 100 likes di postingan', '⭐', 2000);

-- Insert discussion groups
INSERT INTO public.discussion_groups (name, description, category) VALUES
('Gizi Balita', 'Diskusi seputar nutrisi dan makanan untuk balita', 'gizi'),
('Kesehatan Gigi Keluarga', 'Tips dan trik merawat gigi seluruh anggota keluarga', 'gigi'),
('Sanitasi & Kebersihan', 'Berbagi tips menjaga kebersihan rumah dan lingkungan', 'sanitasi'),
('Ibu Hamil Sehat', 'Diskusi khusus untuk ibu hamil dan persiapan melahirkan', 'kehamilan'),
('Resep Sehat Keluarga', 'Berbagi resep makanan sehat dan bergizi', 'resep');

-- Insert daily challenges
INSERT INTO public.daily_challenges (title, description, points, challenge_type, icon) VALUES
('Baca 1 Artikel Kesehatan', 'Baca artikel tentang gizi, kesehatan gigi, atau sanitasi', 50, 'read_article', '📖'),
('Tanya AI Tentang Kesehatan', 'Ajukan pertanyaan kepada asisten AI', 30, 'ask_ai', '🤖'),
('Berpartisipasi di Komunitas', 'Posting atau komentar di forum komunitas', 75, 'community_post', '💬'),
('Bagikan Tips Kesehatan', 'Bagikan tips kesehatan di media sosial', 100, 'health_tip', '💡'),
('Selesaikan Kuis Harian', 'Jawab kuis kesehatan dengan benar', 60, 'daily_quiz', '🧠');

-- Note: Events will be created by users through the application interface
-- Sample events can be added manually after users are registered

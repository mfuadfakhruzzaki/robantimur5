-- Add sample content materials
-- Run this script after you have at least one user registered

DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the first user to use as content creator
    SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert content materials if they don't exist
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

## Tips untuk Anak-anak

### Membuat Sikat Gigi Menyenangkan
- Pilih sikat gigi dengan karakter favorit
- Sikat gigi bersama-sama
- Gunakan lagu atau timer 2 menit
- Berikan pujian setelah selesai

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

## Mencegah Demam Berdarah

### 3M Plus
- **Menguras** bak mandi dan tempat air seminggu sekali
- **Menutup** rapat tempat penyimpanan air
- **Mendaur ulang** barang bekas yang bisa menampung air
- **Plus**: gunakan bubuk larvasida, pelihara ikan pemakan jentik

*Ingat, Bu: Sanitasi yang baik dimulai dari kebiasaan kecil sehari-hari. Libatkan seluruh anggota keluarga untuk menjaga kebersihan bersama-sama.*',
             'sanitasi', '6 menit', ARRAY['Cuci Tangan yang Benar', 'Kebersihan Dapur', 'Pengelolaan Sampah', '3M Plus DBD'], admin_user_id),

            ('mpasi-6-bulan', 'MPASI 6 Bulan', 'Panduan lengkap memulai MPASI untuk bayi 6 bulan',
             '# MPASI 6 Bulan: Panduan Memulai Makanan Pendamping ASI

## Kapan Mulai MPASI?

Bayi siap MPASI ketika:
- Usia 6 bulan
- Bisa duduk dengan bantuan
- Menunjukkan ketertarikan pada makanan
- Refleks lidah sudah hilang

## Menu MPASI Pertama

### Minggu 1-2: Pengenalan Rasa
- **Bubur beras putih** (tanpa garam/gula)
- **Pisang kerok** yang matang
- **Alpukat** yang lembut
- Berikan 1 jenis makanan selama 3-4 hari

### Minggu 3-4: Variasi Sayuran
- **Wortel** kukus dihaluskan
- **Labu kuning** kukus
- **Brokoli** kukus (bagian bunga)
- Tetap satu jenis per 3-4 hari

## Tips Sukses MPASI

### Persiapan
- Cuci tangan dan peralatan dengan bersih
- Gunakan peralatan khusus bayi
- Masak hingga benar-benar matang
- Haluskan sesuai kemampuan bayi

### Pemberian
- Mulai dengan 1-2 sendok teh
- Berikan saat bayi tidak terlalu lapar
- Sabar jika bayi menolak
- Tetap berikan ASI sebagai makanan utama

*Ingat, Bu: MPASI adalah proses belajar. Jangan khawatir jika bayi belum mau makan banyak di awal. Yang penting konsisten dan sabar.*',
             'gizi', '7 menit', ARRAY['MPASI Pertama', 'Menu 6 Bulan', 'Tips MPASI', 'Makanan Bayi'], admin_user_id)
        ) AS v(slug, title, description, content, category, read_time, topics, created_by)
        WHERE NOT EXISTS (SELECT 1 FROM public.content_materials WHERE content_materials.slug = v.slug);
        
        -- Insert sample events
        INSERT INTO public.events (title, description, event_date, event_time, location, event_type, max_attendees, created_by) 
        SELECT * FROM (VALUES
            ('Posyandu Melati', 'Pemeriksaan kesehatan rutin untuk balita dan ibu', '2024-02-15', '08:00 - 12:00', 'Balai Desa Roban Timur', 'posyandu', 50, admin_user_id),
            ('Penyuluhan Gizi Balita', 'Edukasi tentang nutrisi yang tepat untuk balita', '2024-02-18', '09:00 - 11:00', 'Puskesmas Roban', 'edukasi', 30, admin_user_id),
            ('Senam Sehat Ibu-Ibu', 'Olahraga bersama untuk menjaga kesehatan', '2024-02-20', '06:00 - 07:00', 'Lapangan Desa', 'olahraga', 100, admin_user_id),
            ('Workshop MPASI', 'Belajar membuat MPASI bergizi untuk bayi 6 bulan', '2024-02-25', '13:00 - 16:00', 'Balai Desa Roban Timur', 'workshop', 25, admin_user_id)
        ) AS v(title, description, event_date, event_time, location, event_type, max_attendees, created_by)
        WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE events.title = v.title);
        
    END IF;
END $$;

-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create content_materials table for admin-managed content
CREATE TABLE IF NOT EXISTS public.content_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- gizi, gigi, sanitasi
  read_time TEXT DEFAULT '5 menit',
  topics TEXT[] DEFAULT '{}',
  video_url TEXT,
  video_title TEXT,
  video_description TEXT,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create educational_videos table
CREATE TABLE IF NOT EXISTS public.educational_videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  duration TEXT,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.content_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_materials
CREATE POLICY "Content materials are viewable by everyone" ON public.content_materials FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage content materials" ON public.content_materials FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- RLS policies for educational_videos
CREATE POLICY "Videos are viewable by everyone" ON public.educational_videos FOR SELECT USING (true);
CREATE POLICY "Admins can manage videos" ON public.educational_videos FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Insert default content materials (migrating from hardcoded content)
INSERT INTO public.content_materials (slug, title, description, content, category, read_time, topics, created_by) 
SELECT 
  'gizi-keluarga',
  'Gizi Keluarga',
  'Panduan lengkap nutrisi seimbang untuk seluruh anggota keluarga',
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
  'gizi',
  '5 menit',
  ARRAY['Menu 4 Sehat 5 Sempurna', 'Gizi Balita', 'Makanan Bergizi Murah'],
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.content_materials WHERE slug = 'gizi-keluarga');

-- Create admin user function
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track video views
CREATE OR REPLACE FUNCTION public.increment_video_views(video_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.educational_videos 
  SET view_count = view_count + 1
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

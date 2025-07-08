# Web Edukasi Kesehatan KKN - SehatKeluarga

Platform edukasi kesehatan untuk ibu-ibu muda di wilayah Roban Timur, Batang dengan fitur chatbot AI berbasis Gemini API.

## 🎯 Fitur Utama

- **Landing Page** yang ramah mobile dengan design menarik
- **Materi Edukasi** tentang gizi keluarga, kesehatan gigi, dan sanitasi
- **Chatbot AI** untuk menjawab pertanyaan kesehatan secara interaktif
- **Kontak Darurat** dan informasi layanan kesehatan terdekat
- **Responsive Design** yang optimal untuk smartphone

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **AI**: Gemini 1.5 Flash API (terintegrasi dengan konfigurasi API key)
- **Deployment**: Vercel
- **Icons**: Lucide React

## 🚀 Cara Menjalankan

1. **Clone repository**
   \`\`\`bash
   git clone <repository-url>
   cd robantimur5
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Setup environment variables**
   \`\`\`bash
   cp .env.example .env.local

   # Edit .env.local dan tambahkan API keys yang diperlukan

   \`\`\`

4. **Konfigurasi API Keys**

   - Dapatkan Gemini API key dari: https://makersuite.google.com/app/apikey
   - Tambahkan ke file `.env.local`:
     \`\`\`
     GEMINI_API_KEY=your_gemini_api_key_here
     \`\`\`

5. **Jalankan development server**
   \`\`\`bash
   pnpm dev
   \`\`\`

6. **Buka browser** dan akses `http://localhost:3000`

## 📱 Struktur Aplikasi

\`\`\`
/web-edukasi-kkn
├── app/
│ ├── page.tsx # Landing page
│ ├── materi/
│ │ ├── page.tsx # Daftar materi
│ │ └── [slug]/page.tsx # Detail materi
│ ├── chatbot/page.tsx # Interface chatbot
│ ├── kontak/page.tsx # Kontak & info penting
│ └── api/chat/route.ts # API endpoint chatbot
├── components/ui/ # Komponen UI Shadcn
├── lib/
│ └── gemini.ts # Handler Gemini API
└── public/ # Asset statis
\`\`\`

## 🤖 Integrasi Gemini AI

Aplikasi ini sudah terintegrasi dengan Gemini 1.5 Flash API. Untuk menggunakan chatbot AI:

1. Dapatkan API key dari [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tambahkan ke `.env.local`:
   \`\`\`
   GEMINI_API_KEY=your_api_key_here
   \`\`\`
3. Chatbot akan secara otomatis berfungsi setelah API key dikonfigurasi

**Catatan**: Tanpa API key, chatbot akan menampilkan pesan error yang meminta konfigurasi.

## 📋 Konten Materi

### 1. Gizi Keluarga

- Menu 4 Sehat 5 Sempurna
- Tips gizi balita
- Makanan bergizi dengan budget terbatas
- Menu seminggu keluarga sehat

### 2. Kesehatan Gigi

- Cara sikat gigi yang benar
- Perawatan gigi anak
- Makanan baik dan buruk untuk gigi
- Pencegahan gigi berlubang

### 3. Sanitasi Keluarga

- Cuci tangan 6 langkah WHO
- Kebersihan dapur dan makanan
- Pengelolaan sampah
- Pencegahan demam berdarah (3M Plus)

## 🎨 Design System

- **Primary Color**: Pink (#EC4899)
- **Secondary Color**: Purple (#8B5CF6)
- **Accent Colors**: Green, Blue untuk kategori
- **Typography**: Inter font family
- **Components**: Shadcn/UI dengan customization

## 📞 Kontak Support

Untuk pertanyaan teknis atau saran pengembangan:

- Email: [email-kkn@example.com]
- WhatsApp: [nomor-koordinator]

## 📄 Lisensi

Proyek ini dibuat untuk keperluan KKN dan edukasi masyarakat. Silakan gunakan dan modifikasi sesuai kebutuhan.

---

**Dibuat dengan ❤️ untuk masyarakat Roban Timur, Batang**

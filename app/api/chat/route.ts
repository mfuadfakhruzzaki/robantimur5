import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { askGemini } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Pesan tidak valid" }, { status: 400 });
    }

    // Try to get user for stats if logged in, but don't require it for basic chat
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    let response: string;

    try {
      // Use Gemini API for AI response
      response = await askGemini(message);
    } catch (error) {
      // Fallback to static responses if Gemini fails
      console.log("Gemini API failed, using fallback:", error);
      response = generateAIResponse(message);
    }

    // If user is logged in, update stats and log activity
    if (user && !authError) {
      try {
        // Update user stats for AI question
        await supabase.rpc("update_user_stats", {
          user_id: user.id,
          activity_type: "ai_question",
          points: 30,
        });

        // Log activity
        await supabase.from("activity_log").insert({
          user_id: user.id,
          activity_type: "ai_question",
          activity_title: `Bertanya: "${message.substring(0, 50)}..."`,
          points_earned: 30,
        });

        // Update streak
        await supabase.rpc("update_user_streak", { user_id: user.id });

        // Check for new badges
        await supabase.rpc("check_and_award_badges", { user_id: user.id });
      } catch (statsError) {
        console.error("Error updating user stats:", statsError);
        // Continue anyway, don't fail the chat
      }
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem" },
      { status: 500 }
    );
  }
}

// Enhanced AI response generator with more conversational and contextual responses
const generateAIResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  // Respons untuk minuman manis/es teh
  if (
    lowerMessage.includes("esteh") ||
    lowerMessage.includes("es teh") ||
    lowerMessage.includes("teh manis") ||
    lowerMessage.includes("minuman manis")
  ) {
    if (
      lowerMessage.includes("anak") ||
      lowerMessage.includes("bayi") ||
      lowerMessage.includes("balita")
    ) {
      return "Wah, untuk anak-anak sebaiknya hindari es teh manis ya, Bu. Gula berlebihan bisa merusak gigi dan bikin anak susah makan makanan bergizi. Coba ganti dengan air putih, atau kalau mau rasa, bisa air kelapa muda atau jus buah segar tanpa gula tambahan. Anak di bawah 2 tahun sebaiknya sama sekali tidak diberi minuman manis.";
    }
    return "Es teh manis boleh sesekali, Bu, tapi jangan terlalu sering ya. Gula berlebihan bisa bikin berat badan naik dan tidak baik untuk gigi. Kalau haus, air putih tetap yang terbaik. Kalau mau minuman yang segar, coba infused water dengan irisan lemon atau mentimun.";
  }

  // Respons untuk pertanyaan gizi yang lebih spesifik
  if (
    lowerMessage.includes("gizi") ||
    lowerMessage.includes("nutrisi") ||
    lowerMessage.includes("makanan") ||
    lowerMessage.includes("makan")
  ) {
    if (lowerMessage.includes("bayi") || lowerMessage.includes("mpasi")) {
      if (lowerMessage.includes("6 bulan") || lowerMessage.includes("mulai")) {
        return "Untuk MPASI pertama bayi 6 bulan, Bu, mulai dengan yang sederhana dulu. Bubur beras putih atau pisang kerok bisa jadi pilihan. Berikan satu jenis makanan selama 3-4 hari untuk lihat reaksi alergi. Teksturnya harus halus banget ya, Bu. Jangan tambah garam, gula, atau bumbu lainnya dulu.";
      }
      if (
        lowerMessage.includes("susah makan") ||
        lowerMessage.includes("tidak mau")
      ) {
        return "Sabar ya, Bu. Bayi memang butuh waktu untuk terbiasa dengan rasa dan tekstur baru. Coba variasikan bentuk dan warna makanan. Buat suasana makan yang menyenangkan, jangan dipaksa. Kalau ditolak, coba lagi besok dengan cara yang berbeda. Yang penting tetap berikan ASI sebagai makanan utama.";
      }
      return "Untuk MPASI yang baik, Bu, pastikan ada karbohidrat (nasi/kentang), protein (telur/ikan/ayam), dan sayuran. Mulai dari tekstur halus, lalu bertahap ke kasar. Berikan variasi rasa dan warna agar anak tidak bosan. Ingat, porsi bayi masih kecil, sekitar 2-3 sendok makan sudah cukup untuk awal.";
    }

    if (
      lowerMessage.includes("susah makan") ||
      lowerMessage.includes("tidak mau makan") ||
      lowerMessage.includes("pilih-pilih")
    ) {
      return "Anak susah makan memang bikin pusing ya, Bu. Coba tips ini: buat makanan jadi menarik dengan bentuk lucu, libatkan anak dalam menyiapkan makanan, makan bersama keluarga, dan jangan berikan camilan 2 jam sebelum makan. Yang penting jangan dipaksa, tapi tetap tawarkan makanan sehat dengan sabar.";
    }

    if (
      lowerMessage.includes("gemuk") ||
      lowerMessage.includes("obesitas") ||
      lowerMessage.includes("kegemukan")
    ) {
      return "Kalau anak kegemukan, Bu, fokus ke pola makan sehat bukan diet ketat. Kurangi gorengan dan makanan manis, perbanyak sayur dan buah, dan ajak anak beraktivitas fisik seperti bermain di luar. Jangan sampai anak merasa dibatasi makanannya, tapi alihkan ke pilihan yang lebih sehat.";
    }

    return "Untuk gizi keluarga yang baik, Bu, ingat prinsip 'Isi Piringku': setengah piring sayur dan buah, seperempat nasi/makanan pokok, seperempat lauk protein. Variasikan menu setiap hari, pilih bahan segar, dan jangan lupa minum air putih 8 gelas sehari.";
  }

  // Respons untuk kesehatan gigi yang lebih kontekstual
  if (
    lowerMessage.includes("gigi") ||
    lowerMessage.includes("sikat gigi") ||
    lowerMessage.includes("sakit gigi")
  ) {
    if (
      lowerMessage.includes("tidak mau") ||
      lowerMessage.includes("susah") ||
      lowerMessage.includes("menolak")
    ) {
      return "Anak tidak mau sikat gigi ya, Bu? Coba buat jadi permainan seru! Sikat gigi bareng sambil nyanyi lagu favorit, beli sikat gigi dengan karakter yang dia suka, atau biarkan dia pilih sendiri pasta giginya. Bisa juga pakai aplikasi sikat gigi yang ada timer dan musik. Yang penting konsisten dan sabar.";
    }

    if (
      lowerMessage.includes("sakit") ||
      lowerMessage.includes("nyeri") ||
      lowerMessage.includes("bengkak")
    ) {
      return "Kalau gigi sakit, Bu, untuk pertolongan pertama bisa berkumur air garam hangat atau kompres pipi dengan es batu. Tapi ini cuma sementara ya. Kalau sakitnya tidak hilang dalam 1-2 hari atau ada bengkak, segera ke dokter gigi atau puskesmas. Jangan tunda karena bisa makin parah.";
    }

    if (
      lowerMessage.includes("berlubang") ||
      lowerMessage.includes("karies") ||
      lowerMessage.includes("hitam")
    ) {
      return "Gigi berlubang harus segera ditangani dokter gigi, Bu. Untuk mencegah yang lain berlubang: sikat gigi 2 kali sehari dengan pasta berfluoride, kurangi makanan dan minuman manis, dan rutin periksa ke dokter gigi 6 bulan sekali. Kalau sudah berlubang, jangan dibiarkan karena bisa infeksi.";
    }

    return "Untuk kesehatan gigi yang baik, Bu, sikat gigi 2 kali sehari dengan teknik yang benar: gerakan memutar dari gusi ke ujung gigi, jangan lupa sikat lidah. Gunakan pasta gigi berfluoride, dan ganti sikat gigi setiap 3 bulan. Batasi makanan manis dan lengket ya.";
  }

  // Respons untuk sanitasi yang lebih praktis
  if (
    lowerMessage.includes("sanitasi") ||
    lowerMessage.includes("kebersihan") ||
    lowerMessage.includes("cuci tangan") ||
    lowerMessage.includes("demam berdarah") ||
    lowerMessage.includes("dbd")
  ) {
    if (
      lowerMessage.includes("demam berdarah") ||
      lowerMessage.includes("dbd") ||
      lowerMessage.includes("nyamuk")
    ) {
      return "Untuk cegah DBD, Bu, yang penting 3M Plus: Menguras bak mandi dan tempat air seminggu sekali, Menutup rapat tempat penyimpanan air, Mendaur ulang barang bekas yang bisa menampung air. Plus-nya: pakai bubuk larvasida, pelihara ikan pemakan jentik, dan periksa sudut-sudut rumah yang bisa jadi genangan air.";
    }

    if (
      lowerMessage.includes("cuci tangan") ||
      lowerMessage.includes("sabun")
    ) {
      return "Cuci tangan yang benar itu penting banget, Bu. Pakai sabun, gosok minimal 20 detik (sambil nyanyi 'Selamat Ulang Tahun' 2 kali), jangan lupa sela-sela jari, ujung jari, dan ibu jari. Cuci tangan sebelum makan, setelah dari toilet, setelah pegang hewan atau sampah, dan setelah batuk/bersin.";
    }

    if (
      lowerMessage.includes("diare") ||
      lowerMessage.includes("mencret") ||
      lowerMessage.includes("sakit perut")
    ) {
      return "Kalau ada yang diare di rumah, Bu, pastikan kebersihan ekstra ketat. Cuci tangan pakai sabun setelah ke toilet dan sebelum makan, masak air sampai mendidih, cuci buah dan sayur dengan bersih, dan pisahkan alat makan yang dipakai orang sakit. Kalau diare lebih dari 3 hari, segera ke dokter.";
    }

    return "Kebersihan rumah kunci kesehatan keluarga, Bu. Sapu dan pel lantai setiap hari, bersihkan kamar mandi rutin, buang sampah pada tempatnya dan tutup rapat, pastikan air minum bersih, dan jaga ventilasi rumah agar udara segar masuk. Cuci tangan pakai sabun jadi kebiasaan untuk semua anggota keluarga.";
  }

  // Respons untuk kehamilan dan ibu hamil
  if (
    lowerMessage.includes("hamil") ||
    lowerMessage.includes("ibu hamil") ||
    lowerMessage.includes("mengandung")
  ) {
    if (lowerMessage.includes("mual") || lowerMessage.includes("muntah")) {
      return "Mual muntah saat hamil normal kok, Bu, terutama trimester pertama. Coba makan sedikit tapi sering, hindari makanan berminyak dan berbau menyengat, minum air putih yang cukup, dan istirahat yang cukup. Kalau mual muntah parah sampai tidak bisa makan sama sekali, segera konsultasi ke bidan atau dokter.";
    }

    if (
      lowerMessage.includes("makanan") ||
      lowerMessage.includes("gizi") ||
      lowerMessage.includes("nutrisi")
    ) {
      return "Ibu hamil butuh gizi ekstra, Bu. Perbanyak sayuran hijau (bayam, kangkung), buah-buahan, protein (telur, ikan, daging, tempe), dan susu. Minum air putih minimal 8 gelas sehari. Hindari makanan mentah, alkohol, dan batasi kafein. Minum tablet tambah darah sesuai anjuran bidan ya.";
    }

    return "Untuk ibu hamil, yang penting konsumsi makanan bergizi seimbang, istirahat cukup, olahraga ringan seperti jalan santai, dan rutin periksa ke bidan atau dokter. Hindari stres berlebihan, rokok, dan asap rokok. Jaga kebersihan diri dan lingkungan untuk mencegah infeksi.";
  }

  // Respons untuk pertanyaan umum kesehatan anak
  if (
    lowerMessage.includes("anak") &&
    (lowerMessage.includes("demam") || lowerMessage.includes("panas"))
  ) {
    return "Kalau anak demam, Bu, yang penting jangan panik. Berikan banyak cairan, kompres dengan air hangat (bukan air dingin), pakaikan baju tipis, dan beri paracetamol sesuai dosis berat badan. Kalau demam di atas 38.5°C atau lebih dari 3 hari, segera ke dokter. Jangan berikan aspirin untuk anak ya.";
  }

  if (
    lowerMessage.includes("anak") &&
    (lowerMessage.includes("batuk") || lowerMessage.includes("pilek"))
  ) {
    return "Batuk pilek pada anak biasanya karena virus dan akan sembuh sendiri dalam 7-10 hari, Bu. Berikan banyak cairan hangat, jaga kelembaban udara, dan istirahat yang cukup. Untuk anak di atas 1 tahun bisa diberi madu. Kalau batuk lebih dari 2 minggu atau disertai sesak napas, segera ke dokter.";
  }

  // Respons untuk pertanyaan di luar topik dengan lebih ramah
  if (
    lowerMessage.includes("politik") ||
    lowerMessage.includes("ekonomi") ||
    lowerMessage.includes("bisnis") ||
    lowerMessage.includes("agama") ||
    lowerMessage.includes("olahraga")
  ) {
    return "Maaf ya, Bu, saya khusus membantu pertanyaan seputar kesehatan keluarga seperti gizi, kesehatan gigi, dan sanitasi. Kalau ada pertanyaan lain tentang kesehatan keluarga, saya siap bantu! Misalnya tentang MPASI, cara merawat gigi anak, atau tips menjaga kebersihan rumah.";
  }

  // Respons untuk sapaan
  if (
    lowerMessage.includes("halo") ||
    lowerMessage.includes("hai") ||
    lowerMessage.includes("selamat") ||
    lowerMessage.includes("assalamualaikum")
  ) {
    return "Halo, Bu! Selamat datang di konsultasi kesehatan keluarga. Saya siap membantu menjawab pertanyaan seputar gizi keluarga, kesehatan gigi, dan sanitasi. Ada yang ingin ditanyakan hari ini?";
  }

  // Respons untuk ucapan terima kasih
  if (
    lowerMessage.includes("terima kasih") ||
    lowerMessage.includes("makasih") ||
    lowerMessage.includes("thanks")
  ) {
    return "Sama-sama, Bu! Senang bisa membantu. Jangan ragu untuk bertanya lagi kalau ada hal lain seputar kesehatan keluarga yang ingin diketahui. Semoga keluarga selalu sehat ya! 😊";
  }

  // Respons default yang lebih ramah dan personal
  const responses = [
    "Bisa tolong diperjelas pertanyaannya, Bu? Saya siap membantu dengan pertanyaan seputar gizi keluarga, kesehatan gigi, atau sanitasi. Misalnya: 'Bagaimana cara membuat MPASI 6 bulan?' atau 'Anak saya susah sikat gigi, gimana ya?'",
    "Maaf, saya kurang paham maksud pertanyaannya. Coba tanyakan dengan lebih spesifik ya, Bu. Saya bisa bantu soal makanan bergizi, perawatan gigi, atau menjaga kebersihan rumah. Ada yang mau ditanyakan?",
    "Hmm, sepertinya pertanyaannya belum jelas nih, Bu. Saya khusus membantu masalah kesehatan keluarga. Mau tanya tentang gizi anak, cara sikat gigi yang benar, atau tips mencegah penyakit? Silakan tanya dengan lebih detail ya!",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

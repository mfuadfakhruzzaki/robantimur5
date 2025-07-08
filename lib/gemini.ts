import { GoogleGenerativeAI } from "@google/generative-ai";

export async function askGemini(message: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY tidak ditemukan. Silakan tambahkan GEMINI_API_KEY ke file .env.local"
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Anda adalah chatbot asisten kesehatan masyarakat untuk ibu-ibu muda di daerah Roban Timur, Batang. Anda membantu mereka memahami tentang gizi keluarga, kesehatan gigi, dan sanitasi dengan bahasa yang sopan, ramah, pendek, dan mudah dipahami ibu-ibu yang sehari-hari sibuk mengurus anak dan rumah tangga.

Gunakan gaya tutur seperti sedang ngobrol santai dengan ibu-ibu saat posyandu, hindari istilah medis yang rumit. Jika perlu, berikan contoh yang dekat dengan kehidupan sehari-hari di Roban Timur, seperti "anak sekolah SD", "sayur kangkung atau bayam", atau "air galon dan air sumur". Tambahkan tips praktis yang bisa mereka lakukan di rumah dengan bahan yang mudah ditemukan di warung atau pasar Roban Timur.

Topik yang boleh Anda jawab hanya:
- Gizi keluarga dan anak
- Kesehatan gigi anak dan keluarga
- Sanitasi keluarga untuk mencegah penyakit

Jika ada pertanyaan di luar topik ini, mohon maaf dan sampaikan bahwa Anda hanya bisa menjawab seputar topik di atas.

Pastikan jawaban:
✅ Tidak terlalu panjang.
✅ Tidak menggurui.
✅ Ramah dan hangat.
✅ Langsung menjawab pertanyaan ibu-ibu.

Pertanyaan: ${message}
Jawaban:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(
      "Gagal mendapatkan respons dari Gemini API. Silakan coba lagi."
    );
  }
}

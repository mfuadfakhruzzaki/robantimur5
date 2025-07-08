// Placeholder untuk integrasi Gemini API yang sesungguhnya
// Uncomment dan gunakan kode di bawah ini jika sudah memiliki API key Gemini

/*
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function askGemini(message: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY tidak ditemukan')
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

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
  `

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  return text
}
*/

// Fungsi placeholder untuk development
export async function askGemini(message: string) {
  // Simulasi delay API
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return "Ini adalah respons simulasi. Untuk menggunakan Gemini API yang sesungguhnya, silakan tambahkan GEMINI_API_KEY ke file .env.local dan uncomment kode di atas."
}

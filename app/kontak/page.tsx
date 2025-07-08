import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Phone, MapPin, Clock, Users, Heart } from "lucide-react"

const kontakPenting = [
  {
    nama: "Posyandu Melati",
    alamat: "Jl. Raya Roban Timur No. 15",
    telepon: "0285-123456",
    jadwal: "Setiap Rabu, 08:00 - 12:00",
    layanan: ["Imunisasi", "Penimbangan Balita", "Konsultasi Gizi"],
  },
  {
    nama: "Puskesmas Roban",
    alamat: "Jl. Kesehatan Roban No. 1",
    telepon: "0285-789012",
    jadwal: "Senin - Sabtu, 07:00 - 14:00",
    layanan: ["Pemeriksaan Umum", "KIA", "Gigi", "Sanitasi"],
  },
  {
    nama: "Kader Posyandu - Ibu Sari",
    alamat: "RT 02/RW 01 Roban Timur",
    telepon: "0812-3456-7890",
    jadwal: "Siap dihubungi kapan saja",
    layanan: ["Konsultasi Kesehatan", "Pendampingan Ibu Hamil"],
  },
]

const nomorDarurat = [
  { layanan: "Ambulans Puskesmas", nomor: "0285-789013" },
  { layanan: "Bidan Desa", nomor: "0813-2345-6789" },
  { layanan: "Dokter Jaga", nomor: "0285-789014" },
  { layanan: "Posyandu Darurat", nomor: "0812-3456-7891" },
]

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Kontak & Informasi Penting</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Hubungi Layanan Kesehatan Terdekat</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Berikut adalah kontak penting layanan kesehatan di wilayah Roban Timur, Batang. Jangan ragu untuk
              menghubungi jika membutuhkan bantuan kesehatan keluarga.
            </p>
          </div>

          {/* Nomor Darurat */}
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Nomor Darurat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {nomorDarurat.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="font-medium text-gray-700">{item.layanan}</span>
                    <a href={`tel:${item.nomor}`} className="text-red-600 font-bold hover:text-red-700">
                      {item.nomor}
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Kontak Layanan Kesehatan */}
          <div className="grid gap-6 mb-8">
            {kontakPenting.map((kontak, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Heart className="h-5 w-5 mr-2 text-pink-500" />
                    {kontak.nama}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <span className="text-gray-600">{kontak.alamat}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <a href={`tel:${kontak.telepon}`} className="text-blue-600 hover:text-blue-700 font-medium">
                        {kontak.telepon}
                      </a>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                      <span className="text-gray-600">{kontak.jadwal}</span>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-600 mb-1">Layanan:</p>
                        <div className="flex flex-wrap gap-2">
                          {kontak.layanan.map((layanan, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {layanan}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tips Kontak */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700">Tips Menghubungi Layanan Kesehatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <p>Siapkan informasi lengkap: nama, alamat, keluhan, dan nomor yang bisa dihubungi</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <p>Untuk kondisi darurat, langsung hubungi nomor darurat atau datang ke puskesmas</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <p>Bawa kartu identitas dan kartu BPJS/KIS jika ada saat berkunjung</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">4.</span>
                  <p>Untuk konsultasi ringan, bisa hubungi kader posyandu terlebih dahulu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Masih Butuh Informasi Kesehatan?</h3>
              <p className="mb-4 opacity-90">
                Gunakan asisten AI kami untuk mendapatkan informasi kesehatan dasar sebelum berkonsultasi langsung
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="secondary">
                  <Link href="/chatbot">Tanya AI Sekarang</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-purple-600 bg-transparent"
                >
                  <Link href="/materi">Baca Materi Edukasi</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

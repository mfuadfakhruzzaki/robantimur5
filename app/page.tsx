import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Sparkles, MessageCircle, Trophy } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Ibu Sehat Roban Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <h1 className="text-xl font-bold text-gray-800">
                Ibu Sehat Roban
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/materi"
                className="text-gray-600 hover:text-pink-500"
              >
                Materi
              </Link>
              <Link
                href="/community"
                className="text-gray-600 hover:text-pink-500"
              >
                Komunitas
              </Link>
              <Link
                href="/gamification"
                className="text-gray-600 hover:text-pink-500"
              >
                Pencapaian
              </Link>
              <Link
                href="/chatbot"
                className="text-gray-600 hover:text-pink-500"
              >
                Tanya AI
              </Link>
              <Link
                href="/kontak"
                className="text-gray-600 hover:text-pink-500"
              >
                Kontak
              </Link>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-pink-500"
              >
                Profil
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Belajar Kesehatan Keluarga
              <span className="text-pink-500"> Bersama AI</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Platform edukasi kesehatan untuk ibu-ibu. Pelajari tentang gizi,
              kesehatan gigi, dan sanitasi keluarga dengan bantuan asisten AI
              yang siap menjawab pertanyaan Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-pink-500 hover:bg-pink-600"
              >
                <Link href="/materi">
                  <Users className="mr-2 h-5 w-5" />
                  Belajar Sekarang
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/chatbot">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Tanya AI Sekarang
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Apa yang Bisa Anda Pelajari?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Gizi Keluarga</h4>
                <p className="text-gray-600">
                  Pelajari cara memberikan nutrisi terbaik untuk keluarga dengan
                  menu sehat dan bergizi seimbang.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Kesehatan Gigi</h4>
                <p className="text-gray-600">
                  Tips merawat kesehatan gigi dan mulut untuk seluruh anggota
                  keluarga, mulai dari bayi hingga dewasa.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">
                  Sanitasi Keluarga
                </h4>
                <p className="text-gray-600">
                  Cara menjaga kebersihan rumah dan lingkungan untuk mencegah
                  penyakit dan menjaga kesehatan keluarga.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community & Gamification Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Belajar Lebih Seru Bersama Komunitas
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">
                  Komunitas Ibu Sehat
                </h4>
                <p className="text-gray-600 mb-4">
                  Bergabung dengan komunitas ibu-ibu untuk berbagi pengalaman,
                  tips, dan saling mendukung dalam menjaga kesehatan keluarga.
                </p>
                <Button asChild>
                  <Link href="/community">Gabung Komunitas</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Raih Pencapaian</h4>
                <p className="text-gray-600 mb-4">
                  Kumpulkan poin, raih badge, dan ikuti tantangan harian untuk
                  membuat pembelajaran kesehatan lebih menyenangkan.
                </p>
                <Button asChild>
                  <Link href="/gamification">Lihat Pencapaian</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Siap Mulai Belajar?</h3>
          <p className="text-xl mb-8 opacity-90">
            Dapatkan informasi yang akurat dan tanya langsung ke asisten AI kami
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/materi">Mulai Belajar Sekarang</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image
              src="/logo.png"
              alt="Ibu Sehat Roban Logo"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="text-lg font-semibold">Ibu Sehat Roban</span>
          </div>
          <p className="text-gray-400">
            Platform edukasi kesehatan untuk keluarga Roban yang lebih sehat
          </p>
          <div className="mt-4 text-sm text-gray-500">
            © 2024 Ibu Sehat Roban - Program KKN Roban Timur, Batang
          </div>
        </div>
      </footer>
    </div>
  );
}

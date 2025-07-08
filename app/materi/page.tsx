"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Heart,
  Sparkles,
  Users,
  Clock,
  BookOpen,
  Settings,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider-simple";

interface ContentMaterial {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  read_time: string | null;
  topics: string[];
  is_published: boolean;
}

const categoryIcons = {
  gizi: Heart,
  gigi: Sparkles,
  sanitasi: Users,
};

const categoryColors = {
  gizi: "bg-green-100 text-green-600",
  gigi: "bg-blue-100 text-blue-600",
  sanitasi: "bg-purple-100 text-purple-600",
};

export default function MateriPage() {
  const [materials, setMaterials] = useState<ContentMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from("content_materials")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">
                Materi Edukasi
              </h1>
            </div>
            {isAdmin && (
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/content">
                  <Settings className="h-4 w-4 mr-2" />
                  Kelola Konten
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Pilih Materi yang Ingin Dipelajari
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Setiap materi dirancang khusus untuk ibu-ibu muda dengan bahasa yang
            mudah dipahami dan tips praktis yang bisa langsung diterapkan di
            rumah.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {materials.map((material) => {
            const IconComponent =
              categoryIcons[material.category as keyof typeof categoryIcons] ||
              BookOpen;
            const colorClass =
              categoryColors[
                material.category as keyof typeof categoryColors
              ] || "bg-gray-100 text-gray-600";

            return (
              <Card
                key={material.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {material.title}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {material.read_time || "5 menit"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{material.description}</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-gray-700">
                      Yang akan dipelajari:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {material.topics.map((topic, index) => (
                        <li key={index} className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-2 text-gray-400" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/materi/${material.slug}`}>Baca Materi</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA to Chatbot */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ada Pertanyaan?</h3>
          <p className="mb-6 opacity-90">
            Setelah membaca materi, jangan ragu untuk bertanya kepada asisten AI
            kami. Dapatkan jawaban yang disesuaikan dengan kebutuhan keluarga
            Anda.
          </p>
          <Button asChild variant="secondary" size="lg">
            <Link href="/chatbot">Tanya AI Sekarang</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

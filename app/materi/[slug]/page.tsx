"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MessageCircle, Clock, BookOpen, Play, Eye } from "lucide-react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"

interface ContentMaterial {
  id: string
  slug: string
  title: string
  description: string | null
  content: string
  category: string
  read_time: string | null
  topics: string[]
  video_url: string | null
  video_title: string | null
  video_description: string | null
}

interface EducationalVideo {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  duration: string | null
  view_count: number
}

export default function MateriDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [material, setMaterial] = useState<ContentMaterial | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<EducationalVideo[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { slug } = await params

      try {
        // Fetch material content
        const { data: materialData, error: materialError } = await supabase
          .from("content_materials")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single()

        if (materialError) throw materialError
        setMaterial(materialData)

        // Fetch related videos
        const { data: videosData } = await supabase
          .from("educational_videos")
          .select("*")
          .eq("category", materialData.category)
          .limit(3)

        if (videosData) setRelatedVideos(videosData)

        // Track article read for logged in users
        if (user) {
          await supabase.rpc("update_user_stats", {
            user_id: user.id,
            activity_type: "article_read",
            points: 50,
          })

          await supabase.from("activity_log").insert({
            user_id: user.id,
            activity_type: "article_read",
            activity_title: `Membaca: "${materialData.title}"`,
            points_earned: 50,
          })

          await supabase.rpc("update_user_streak", { user_id: user.id })
          await supabase.rpc("check_and_award_badges", { user_id: user.id })
        }
      } catch (error) {
        console.error("Error fetching material:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params, user])

  const handleVideoClick = async (videoId: string) => {
    try {
      await supabase.rpc("increment_video_views", { video_id: videoId })
      // Refresh video data to show updated view count
      const { data: updatedVideos } = await supabase
        .from("educational_videos")
        .select("*")
        .eq("category", material?.category)
        .limit(3)

      if (updatedVideos) setRelatedVideos(updatedVideos)
    } catch (error) {
      console.error("Error updating video views:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!material) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/materi">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Materi
                </Link>
              </Button>
            </div>
            <Button asChild variant="outline">
              <Link href="/chatbot">
                <MessageCircle className="h-4 w-4 mr-2" />
                Tanya AI
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {material.read_time || "5 menit"}
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <BookOpen className="h-4 w-4 mr-1" />
                Panduan Praktis
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{material.title}</h1>
            {material.description && <p className="text-gray-600">{material.description}</p>}
          </div>

          {/* Featured Video (if available) */}
          {material.video_url && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Play className="h-5 w-5 mr-2 text-red-500" />
                  {material.video_title || "Video Edukasi"}
                </h3>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Video akan ditampilkan di sini</p>
                    <p className="text-sm text-gray-400 mt-1">URL: {material.video_url}</p>
                  </div>
                </div>
                {material.video_description && <p className="text-gray-600">{material.video_description}</p>}
              </CardContent>
            </Card>
          )}

          {/* Article Content */}
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                {material.content.split("\n").map((line, index) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1 key={index} className="text-2xl font-bold mt-8 mb-4 text-gray-800">
                        {line.substring(2)}
                      </h1>
                    )
                  }
                  if (line.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-xl font-semibold mt-6 mb-3 text-gray-800">
                        {line.substring(3)}
                      </h2>
                    )
                  }
                  if (line.startsWith("### ")) {
                    return (
                      <h3 key={index} className="text-lg font-medium mt-4 mb-2 text-gray-700">
                        {line.substring(4)}
                      </h3>
                    )
                  }
                  if (line.startsWith("#### ")) {
                    return (
                      <h4 key={index} className="text-base font-medium mt-3 mb-2 text-gray-700">
                        {line.substring(5)}
                      </h4>
                    )
                  }
                  if (line.startsWith("- **") || line.startsWith("- ")) {
                    return (
                      <li key={index} className="ml-4 mb-1 text-gray-600">
                        {line.substring(2)}
                      </li>
                    )
                  }
                  if (line.startsWith("✅ ")) {
                    return (
                      <div key={index} className="flex items-center mb-2 text-green-600">
                        <span className="mr-2">✅</span>
                        {line.substring(3)}
                      </div>
                    )
                  }
                  if (line.startsWith("⚠️ ")) {
                    return (
                      <div key={index} className="flex items-center mb-2 text-orange-600">
                        <span className="mr-2">⚠️</span>
                        {line.substring(3)}
                      </div>
                    )
                  }
                  if (line.trim() === "") {
                    return <br key={index} />
                  }
                  if (line.startsWith("*") && line.endsWith("*")) {
                    return (
                      <p key={index} className="italic text-gray-600 mt-4 p-4 bg-gray-50 rounded-lg">
                        {line.substring(1, line.length - 1)}
                      </p>
                    )
                  }
                  return (
                    <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                      {line}
                    </p>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Related Videos Section */}
          {relatedVideos.length > 0 && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Play className="h-5 w-5 mr-2 text-red-500" />
                  Video Terkait
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {relatedVideos.map((video) => (
                    <div
                      key={video.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleVideoClick(video.id)}
                    >
                      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                        <Play className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="font-medium text-sm mb-2">{video.title}</h4>
                      {video.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{video.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{video.duration || "5:30"}</span>
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {video.view_count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video Placeholder for Content without Videos */}
          {!material.video_url && relatedVideos.length === 0 && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Play className="h-5 w-5 mr-2 text-red-500" />
                  Video Edukasi
                </h3>
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">Video Segera Hadir</h4>
                    <p className="text-gray-500 max-w-md">
                      Kami sedang menyiapkan video edukasi untuk materi ini. Video akan membantu Anda memahami topik
                      dengan lebih mudah dan menarik.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA Section */}
          <div className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white text-center">
            <h3 className="text-xl font-bold mb-3">Masih Ada Pertanyaan?</h3>
            <p className="mb-4 opacity-90">
              Tanyakan langsung kepada asisten AI kami untuk mendapatkan jawaban yang lebih spesifik sesuai situasi
              keluarga Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="secondary">
                <Link href="/chatbot">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Tanya AI Sekarang
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-purple-600 bg-transparent"
              >
                <Link href="/materi">Baca Materi Lain</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

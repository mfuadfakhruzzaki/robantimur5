"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  User,
  Edit3,
  Heart,
  MessageCircle,
  Trophy,
  Calendar,
  MapPin,
  Users,
  BookOpen,
  Star,
} from "lucide-react"

// Mock user data
const userProfile = {
  id: "user-123",
  name: "Ibu Maya Sari",
  avatar: "/placeholder.svg?height=100&width=100",
  phone: "0812-3456-7890",
  email: "maya.sari@email.com",
  village: "Roban Timur, Batang",
  joinDate: "2024-01-01",
  bio: "Ibu dari 2 anak yang senang belajar tentang kesehatan keluarga. Aktif di komunitas posyandu dan selalu ingin berbagi pengalaman dengan ibu-ibu lainnya.",
  stats: {
    articlesRead: 15,
    questionsAsked: 23,
    communityPosts: 8,
    helpfulAnswers: 12,
    badges: 8,
    points: 3450,
    level: 5,
    streak: 7,
  },
  family: [
    { name: "Andi (Suami)", age: 32, relation: "Suami" },
    { name: "Sari", age: 5, relation: "Anak" },
    { name: "Budi", age: 2, relation: "Anak" },
  ],
}

const recentActivity = [
  {
    id: "1",
    type: "article",
    title: "Membaca artikel 'Gizi Balita yang Optimal'",
    date: "2024-01-15",
    points: 50,
  },
  {
    id: "2",
    type: "community",
    title: "Memposting tips di grup 'Gizi Balita'",
    date: "2024-01-14",
    points: 75,
  },
  {
    id: "3",
    type: "ai",
    title: "Bertanya ke AI tentang MPASI 6 bulan",
    date: "2024-01-14",
    points: 30,
  },
  {
    id: "4",
    type: "badge",
    title: "Mendapat badge 'Streak Kesehatan'",
    date: "2024-01-13",
    points: 100,
  },
]

const savedContent = [
  {
    id: "1",
    title: "Tips Membuat MPASI Bergizi",
    type: "article",
    category: "Gizi Keluarga",
    savedDate: "2024-01-12",
  },
  {
    id: "2",
    title: "Cara Mengajari Anak Sikat Gigi",
    type: "article",
    category: "Kesehatan Gigi",
    savedDate: "2024-01-10",
  },
  {
    id: "3",
    title: "Resep Bubur Sayur untuk Bayi",
    type: "recipe",
    category: "Resep Sehat",
    savedDate: "2024-01-08",
  },
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(userProfile)

  const handleSave = () => {
    // Here you would typically save to database
    setIsEditing(false)
    // Show success message
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "article":
        return <BookOpen className="h-4 w-4 text-blue-500" />
      case "community":
        return <Users className="h-4 w-4 text-green-500" />
      case "ai":
        return <MessageCircle className="h-4 w-4 text-purple-500" />
      case "badge":
        return <Trophy className="h-4 w-4 text-yellow-500" />
      default:
        return <Star className="h-4 w-4 text-gray-500" />
    }
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
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-pink-500" />
                <h1 className="text-xl font-bold text-gray-800">Profil Saya</h1>
              </div>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? "Simpan" : "Edit Profil"}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {userProfile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Nama</Label>
                      <Input
                        id="name"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold mb-2">{userProfile.name}</h2>
                    <p className="text-gray-600 text-sm mb-4">{userProfile.bio}</p>
                  </>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{userProfile.village}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Bergabung {new Date(userProfile.joinDate).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{userProfile.stats.level}</div>
                    <div className="text-xs text-gray-500">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{userProfile.stats.badges}</div>
                    <div className="text-xs text-gray-500">Badge</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Button asChild className="w-full" size="sm">
                    <Link href="/gamification">Lihat Pencapaian</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent" size="sm">
                    <Link href="/community">Ke Komunitas</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Family Members */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Anggota Keluarga
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userProfile.family.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.relation}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {member.age} tahun
                      </Badge>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">
                    <Users className="h-4 w-4 mr-2" />
                    Kelola Anggota Keluarga
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="activity" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activity">Aktivitas</TabsTrigger>
                <TabsTrigger value="stats">Statistik</TabsTrigger>
                <TabsTrigger value="saved">Tersimpan</TabsTrigger>
              </TabsList>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Aktivitas Terbaru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {new Date(activity.date).toLocaleDateString("id-ID")}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                +{activity.points} poin
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Stats Tab */}
              <TabsContent value="stats">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pembelajaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Artikel Dibaca</span>
                          <span className="font-bold text-blue-600">{userProfile.stats.articlesRead}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Pertanyaan ke AI</span>
                          <span className="font-bold text-purple-600">{userProfile.stats.questionsAsked}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Streak Harian</span>
                          <span className="font-bold text-orange-600">{userProfile.stats.streak} hari</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Komunitas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Postingan</span>
                          <span className="font-bold text-green-600">{userProfile.stats.communityPosts}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Jawaban Membantu</span>
                          <span className="font-bold text-yellow-600">{userProfile.stats.helpfulAnswers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Poin</span>
                          <span className="font-bold text-purple-600">{userProfile.stats.points}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Progress Chart Placeholder */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Progress Mingguan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Grafik progress akan ditampilkan di sini</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Saved Tab */}
              <TabsContent value="saved">
                <Card>
                  <CardHeader>
                    <CardTitle>Konten Tersimpan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {savedContent.map((content) => (
                        <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{content.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {content.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Disimpan {new Date(content.savedDate).toLocaleDateString("id-ID")}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              Buka
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  User,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Trophy,
  Star,
  BookOpen,
  MessageCircle,
  Heart,
  Loader2,
  LogOut,
  Shield,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  phone: string | null;
  village: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  level: number;
  current_xp: number;
  total_points: number;
  streak_days: number;
  articles_read: number;
  questions_asked: number;
  community_posts: number;
  helpful_answers: number;
}

interface Activity {
  id: string;
  activity_type: string;
  activity_title: string;
  points_earned: number;
  created_at: string;
}

interface SavedContent {
  id: string;
  content_type: string;
  content_id: string;
  title: string;
  category: string | null;
  saved_at: string;
}

function ProfileContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    village: "",
    bio: "",
  });

  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
      setFormData({
        name: profileData.name || "",
        phone: profileData.phone || "",
        village: profileData.village || "",
        bio: profileData.bio || "",
      });

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (statsError && statsError.code !== "PGRST116") {
        console.error("Error fetching stats:", statsError);
      } else if (statsData) {
        setStats(statsData);
      }

      // Fetch recent activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (activitiesError) {
        console.error("Error fetching activities:", activitiesError);
      } else if (activitiesData) {
        setActivities(activitiesData);
      }

      // Fetch saved content
      const { data: savedData, error: savedError } = await supabase
        .from("saved_content")
        .select("*")
        .eq("user_id", user.id)
        .order("saved_at", { ascending: false })
        .limit(10);

      if (savedError) {
        console.error("Error fetching saved content:", savedError);
      } else if (savedData) {
        setSavedContent(savedData);
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          phone: formData.phone,
          village: formData.village,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // Update local state
      setProfile({
        ...profile,
        name: formData.name,
        phone: formData.phone,
        village: formData.village,
        bio: formData.bio,
        updated_at: new Date().toISOString(),
      });

      setEditing(false);
      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;

    setFormData({
      name: profile.name || "",
      phone: profile.phone || "",
      village: profile.village || "",
      bio: profile.bio || "",
    });
    setEditing(false);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Gagal logout",
        variant: "destructive",
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "article_read":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "ai_question":
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case "community_post":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "badge_earned":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      default:
        return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityTypeText = (type: string) => {
    switch (type) {
      case "article_read":
        return "Membaca Artikel";
      case "ai_question":
        return "Bertanya AI";
      case "community_post":
        return "Posting Komunitas";
      case "badge_earned":
        return "Mendapat Badge";
      default:
        return "Aktivitas";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Profil Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-4">
            Terjadi kesalahan saat memuat profil Anda.
          </p>
          <Button onClick={() => router.push("/")}>Kembali ke Beranda</Button>
        </div>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <h1 className="text-xl font-bold text-gray-800">Profil Saya</h1>
            </div>
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <a href="/admin/dashboard">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center justify-center space-x-2">
                  <CardTitle className="text-xl">{profile.name}</CardTitle>
                  {isAdmin && <Badge variant="secondary">Admin</Badge>}
                </div>
                <p className="text-gray-600">{user?.email}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nama</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Masukkan nama Anda"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="Masukkan nomor telepon"
                      />
                    </div>
                    <div>
                      <Label htmlFor="village">Desa</Label>
                      <Input
                        id="village"
                        value={formData.village}
                        onChange={(e) =>
                          setFormData({ ...formData, village: e.target.value })
                        }
                        placeholder="Masukkan nama desa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        placeholder="Ceritakan tentang diri Anda"
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Simpan
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{profile.phone || "Belum diisi"}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{profile.village || "Belum diisi"}</span>
                    </div>
                    {profile.bio && (
                      <div className="text-sm">
                        <p className="text-gray-700">{profile.bio}</p>
                      </div>
                    )}
                    <Separator />
                    <div className="text-xs text-gray-500">
                      Bergabung:{" "}
                      {new Date(profile.created_at).toLocaleDateString("id-ID")}
                    </div>
                    <Button onClick={() => setEditing(true)} className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profil
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            {stats && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Statistik</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Level</span>
                    <Badge variant="outline">{stats.level}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Poin</span>
                    <span className="font-semibold">{stats.total_points}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">XP Saat Ini</span>
                    <span className="font-semibold">{stats.current_xp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Streak Hari</span>
                    <span className="font-semibold">{stats.streak_days}</span>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {stats.articles_read}
                      </div>
                      <div className="text-xs text-gray-600">Artikel</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {stats.questions_asked}
                      </div>
                      <div className="text-xs text-gray-600">Pertanyaan</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">
                        {stats.community_posts}
                      </div>
                      <div className="text-xs text-gray-600">Postingan</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {stats.helpful_answers}
                      </div>
                      <div className="text-xs text-gray-600">Jawaban</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Activity and Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada aktivitas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        {getActivityIcon(activity.activity_type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {getActivityTypeText(activity.activity_type)}
                            </span>
                            {activity.points_earned > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                +{activity.points_earned} poin
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {activity.activity_title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.created_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Konten Tersimpan</CardTitle>
              </CardHeader>
              <CardContent>
                {savedContent.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Belum ada konten tersimpan</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedContent.map((content) => (
                      <div
                        key={content.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">
                            {content.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {content.content_type}
                            </Badge>
                            {content.category && (
                              <Badge variant="secondary" className="text-xs">
                                {content.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Disimpan:{" "}
                            {new Date(content.saved_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

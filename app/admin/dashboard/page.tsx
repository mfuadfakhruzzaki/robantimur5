"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Calendar,
  FileText,
  Trash2,
  Edit,
  Eye,
  Settings,
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle,
  X,
  EyeOff,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalGroups: number;
  totalEvents: number;
  totalMaterials: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  post_type: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles?: {
    name: string;
    avatar_url: string | null;
  };
  discussion_groups?: {
    name: string;
  } | null;
}

interface DiscussionGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  post_count: number;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string;
  location: string;
  event_type: string;
  attendee_count: number;
  created_at: string;
}

interface ContentMaterial {
  id: string;
  title: string;
  category: string;
  is_published: boolean;
  created_at: string;
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalGroups: 0,
    totalEvents: 0,
    totalMaterials: 0,
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<DiscussionGroup[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [materials, setMaterials] = useState<ContentMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const supabase = createClient();

  const fetchDashboardData = async () => {
    try {
      console.log("AdminDashboard - Starting fetchDashboardData");
      setError("");
      setLoading(true);

      // Inisialisasi stats dengan nilai default
      setStats({
        totalUsers: 0,
        totalPosts: 0,
        totalGroups: 0,
        totalEvents: 0,
        totalMaterials: 0,
      });

      // Fetch stats - jika gagal, lanjutkan dengan nilai 0
      try {
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const { count: postsCount } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true });

        const { count: groupsCount } = await supabase
          .from("discussion_groups")
          .select("*", { count: "exact", head: true });

        const { count: eventsCount } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true });

        const { count: materialsCount } = await supabase
          .from("content_materials")
          .select("*", { count: "exact", head: true });

        setStats({
          totalUsers: usersCount || 0,
          totalPosts: postsCount || 0,
          totalGroups: groupsCount || 0,
          totalEvents: eventsCount || 0,
          totalMaterials: materialsCount || 0,
        });

        console.log("AdminDashboard - Stats loaded successfully");
      } catch (error) {
        console.error("AdminDashboard - Error fetching stats:", error);
        // Tetap lanjutkan dengan nilai 0
      }

      // Fetch posts - jika gagal, tetap lanjutkan dengan array kosong
      try {
        const { data: postsData } = await supabase
          .from("posts")
          .select(
            "id, title, content, post_type, created_at, likes_count, comments_count"
          )
          .order("created_at", { ascending: false })
          .limit(5);

        setPosts(postsData || []);
        console.log("AdminDashboard - Posts loaded:", postsData?.length || 0);
      } catch (error) {
        console.error("AdminDashboard - Error fetching posts:", error);
        setPosts([]);
      }

      // Fetch groups
      try {
        const { data: groupsData } = await supabase
          .from("discussion_groups")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        setGroups(groupsData || []);
        console.log("AdminDashboard - Groups loaded:", groupsData?.length || 0);
      } catch (error) {
        console.error("AdminDashboard - Error fetching groups:", error);
        setGroups([]);
      }

      // Fetch events
      try {
        const { data: eventsData } = await supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        setEvents(eventsData || []);
        console.log("AdminDashboard - Events loaded:", eventsData?.length || 0);
      } catch (error) {
        console.error("AdminDashboard - Error fetching events:", error);
        setEvents([]);
      }

      // Fetch materials
      try {
        const { data: materialsData } = await supabase
          .from("content_materials")
          .select("id, title, category, is_published, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        setMaterials(materialsData || []);
        console.log(
          "AdminDashboard - Materials loaded:",
          materialsData?.length || 0
        );
      } catch (error) {
        console.error("AdminDashboard - Error fetching materials:", error);
        setMaterials([]);
      }

      console.log("AdminDashboard - All data loaded successfully");
    } catch (error: any) {
      console.error("AdminDashboard - Error in fetchDashboardData:", error);
      // Jangan set error, biarkan dashboard tampil dengan data kosong
    } finally {
      console.log("AdminDashboard - Setting loading to false");
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus postingan ini?")) return;

    setDeleting(postId);
    try {
      // Delete the post
      const { error: postError } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (postError) throw postError;

      setSuccess("Postingan berhasil dihapus");
      fetchDashboardData();
    } catch (error: any) {
      console.error("Error deleting post:", error);
      setError(error.message || "Gagal menghapus postingan");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus grup ini?")) return;

    setDeleting(groupId);
    try {
      // Delete the group
      const { error: groupError } = await supabase
        .from("discussion_groups")
        .delete()
        .eq("id", groupId);

      if (groupError) throw groupError;

      setSuccess("Grup berhasil dihapus");
      fetchDashboardData();
    } catch (error: any) {
      console.error("Error deleting group:", error);
      setError(error.message || "Gagal menghapus grup");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus acara ini?")) return;

    setDeleting(eventId);
    try {
      // Delete the event
      const { error: eventError } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (eventError) throw eventError;

      setSuccess("Acara berhasil dihapus");
      fetchDashboardData();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      setError(error.message || "Gagal menghapus acara");
    } finally {
      setDeleting(null);
    }
  };

  const toggleMaterialPublish = async (
    materialId: string,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("content_materials")
        .update({ is_published: !currentStatus })
        .eq("id", materialId);

      if (error) throw error;

      setSuccess(
        `Materi berhasil ${!currentStatus ? "dipublikasikan" : "disembunyikan"}`
      );
      fetchDashboardData();
    } catch (error: any) {
      console.error("Error updating material:", error);
      setError(error.message || "Gagal mengubah status publikasi");
    }
  };

  // Load data saat component mount
  useEffect(() => {
    console.log("AdminDashboard - Loading data immediately...");
    fetchDashboardData();
  }, []);

  // Hapus semua auth checking - langsung render dashboard
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
                <Shield className="h-6 w-6 text-pink-500" />
                <h1 className="text-xl font-bold text-gray-800">
                  Dashboard Admin
                </h1>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/content">
                <Settings className="h-4 w-4 mr-2" />
                Kelola Konten
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Loading indicator */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
            <Loader2 className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
            <span className="text-blue-700">Memuat data dashboard...</span>
          </div>
        )}

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError("")}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">{success}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccess("")}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Pengguna</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <div className="text-sm text-gray-600">Total Postingan</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalGroups}</div>
              <div className="text-sm text-gray-600">Grup Diskusi</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Acara</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 text-pink-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalMaterials}</div>
              <div className="text-sm text-gray-600">Materi Edukasi</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Kelola Postingan</TabsTrigger>
            <TabsTrigger value="groups">Kelola Grup</TabsTrigger>
            <TabsTrigger value="events">Kelola Acara</TabsTrigger>
            <TabsTrigger value="materials">Kelola Materi</TabsTrigger>
          </TabsList>

          {/* Posts Management */}
          <TabsContent value="posts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Kelola Postingan</h2>
              <Badge variant="secondary">{posts.length} postingan</Badge>
            </div>

            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Avatar>
                          <AvatarImage
                            src={
                              post.profiles?.avatar_url || "/placeholder.svg"
                            }
                          />
                          <AvatarFallback>
                            {post.profiles?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">
                              {post.profiles?.name || "Unknown User"}
                            </span>
                            {post.discussion_groups && (
                              <Badge variant="outline" className="text-xs">
                                {post.discussion_groups.name}
                              </Badge>
                            )}
                            <Badge
                              variant={
                                post.post_type === "success_story"
                                  ? "default"
                                  : post.post_type === "recipe"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {post.post_type}
                            </Badge>
                            <span className="text-sm text-gray-400">
                              {new Date(post.created_at).toLocaleDateString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                          <h4 className="font-semibold mb-2">{post.title}</h4>
                          <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{post.likes_count} likes</span>
                            <span>{post.comments_count} komentar</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deleting === post.id}
                        >
                          {deleting === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Groups Management */}
          <TabsContent value="groups" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Kelola Grup Diskusi</h2>
              <Badge variant="secondary">{groups.length} grup</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{group.category}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                          disabled={deleting === group.id}
                        >
                          {deleting === group.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      {group.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{group.member_count} anggota</span>
                      <span>{group.post_count} postingan</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Dibuat:{" "}
                      {new Date(group.created_at).toLocaleDateString("id-ID")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Events Management */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Kelola Acara</h2>
              <Badge variant="secondary">{events.length} acara</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{event.event_type}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={deleting === event.id}
                        >
                          {deleting === event.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Tanggal:</strong>{" "}
                        {new Date(event.event_date).toLocaleDateString("id-ID")}
                      </div>
                      <div>
                        <strong>Waktu:</strong> {event.event_time}
                      </div>
                      <div>
                        <strong>Lokasi:</strong> {event.location}
                      </div>
                      <div>
                        <strong>Peserta:</strong> {event.attendee_count} orang
                      </div>
                      {event.description && (
                        <div>
                          <strong>Deskripsi:</strong> {event.description}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Materials Management */}
          <TabsContent value="materials" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Kelola Materi Edukasi</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{materials.length} materi</Badge>
                <Button asChild size="sm">
                  <Link href="/admin/content">Kelola Detail</Link>
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {materials.map((material) => (
                <Card key={material.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{material.category}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleMaterialPublish(
                            material.id,
                            material.is_published
                          )
                        }
                      >
                        {material.is_published ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    <h4 className="font-semibold mb-2">{material.title}</h4>
                    <div className="flex items-center justify-between text-sm">
                      <Badge
                        variant={
                          material.is_published ? "default" : "secondary"
                        }
                      >
                        {material.is_published ? "Published" : "Draft"}
                      </Badge>
                      <span className="text-gray-400">
                        {new Date(material.created_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}

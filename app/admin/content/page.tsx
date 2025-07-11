"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/components/auth/auth-provider-simple";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Video,
  FileText,
  Loader2,
} from "lucide-react";

interface ContentMaterial {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  category: string;
  read_time: string | null;
  topics: string[];
  video_url: string | null;
  video_title: string | null;
  video_description: string | null;
  is_published: boolean;
  created_at: string;
}

interface EducationalVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string;
  duration: string | null;
  is_featured: boolean;
  view_count: number;
  created_at: string;
}

function AdminContentPageContent() {
  const [materials, setMaterials] = useState<ContentMaterial[]>([]);
  const [videos, setVideos] = useState<EducationalVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMaterial, setEditingMaterial] =
    useState<ContentMaterial | null>(null);
  const [editingVideo, setEditingVideo] = useState<EducationalVideo | null>(
    null
  );
  const [showNewMaterialForm, setShowNewMaterialForm] = useState(false);
  const [showNewVideoForm, setShowNewVideoForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const { user, isAdmin } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      // Fetch all materials (including unpublished for admin)
      const { data: materialsData } = await supabase
        .from("content_materials")
        .select("*")
        .order("created_at", { ascending: false });

      if (materialsData) setMaterials(materialsData);

      // Fetch all videos
      const { data: videosData } = await supabase
        .from("educational_videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (videosData) setVideos(videosData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMaterial = async (material: Partial<ContentMaterial>) => {
    console.log("Save material called with:", material);
    console.log("Current user:", user);
    console.log("Is admin:", isAdmin);
    console.log("Material has ID?", !!material.id);
    console.log("Material ID:", material.id);

    if (!user) {
      alert("Error: User not authenticated");
      return;
    }

    setSaving(true);
    try {
      if (material.id) {
        // Update existing material
        console.log("UPDATING material with ID:", material.id);
        const updateData = {
          slug: material.slug,
          title: material.title,
          description: material.description,
          content: material.content,
          category: material.category,
          read_time: material.read_time,
          topics: material.topics,
          video_url: material.video_url,
          video_title: material.video_title,
          video_description: material.video_description,
          is_published: material.is_published,
          updated_at: new Date().toISOString(),
        };

        console.log("Update data:", updateData);

        // Add timeout to prevent hanging
        const updatePromise = supabase
          .from("content_materials")
          .update(updateData)
          .eq("id", material.id);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () =>
              reject(new Error("Update operation timed out after 10 seconds")),
            10000
          );
        });

        console.log("Executing update query...");
        const { error } = (await Promise.race([
          updatePromise,
          timeoutPromise,
        ])) as any;

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }

        console.log("Update operation completed successfully");

        // Separately fetch the updated record to confirm it was updated
        const { data: updatedRecord, error: fetchError } = await supabase
          .from("content_materials")
          .select("*")
          .eq("id", material.id)
          .single();

        if (fetchError) {
          console.warn("Could not fetch updated record:", fetchError);
        } else {
          console.log("Updated record:", updatedRecord);
        }

        alert("Materi berhasil diperbarui!");
      } else {
        // Create new material
        console.log("CREATING new material");
        const insertData = {
          slug: material.slug,
          title: material.title,
          description: material.description,
          content: material.content,
          category: material.category,
          read_time: material.read_time,
          topics: material.topics,
          video_url: material.video_url,
          video_title: material.video_title,
          video_description: material.video_description,
          is_published: material.is_published,
          created_by: user.id,
        };

        console.log("Insert data:", insertData);

        // Add timeout to prevent hanging
        const insertPromise = supabase
          .from("content_materials")
          .insert(insertData);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () =>
              reject(new Error("Insert operation timed out after 10 seconds")),
            10000
          );
        });

        console.log("Executing insert query...");
        const { error } = (await Promise.race([
          insertPromise,
          timeoutPromise,
        ])) as any;

        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }

        console.log("Insert operation completed successfully");
        alert("Materi berhasil ditambahkan!");
      }

      setEditingMaterial(null);
      setShowNewMaterialForm(false);
      fetchData();
    } catch (error: any) {
      console.error("Error saving material:", error);

      // Show detailed error message
      let errorMessage = "Terjadi kesalahan saat menyimpan materi";

      if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      if (error.code) {
        errorMessage += ` (Code: ${error.code})`;
      }

      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVideo = async (video: Partial<EducationalVideo>) => {
    console.log("Save video called with:", video);
    console.log("Current user:", user);
    console.log("Is admin:", isAdmin);
    console.log("Video has ID?", !!video.id);
    console.log("Video ID:", video.id);

    if (!user) {
      alert("Error: User not authenticated");
      return;
    }

    setSaving(true);
    try {
      if (video.id) {
        // Update existing video
        console.log("UPDATING video with ID:", video.id);
        const updateData = {
          title: video.title,
          description: video.description,
          video_url: video.video_url,
          thumbnail_url: video.thumbnail_url,
          category: video.category,
          duration: video.duration,
          is_featured: video.is_featured,
          updated_at: new Date().toISOString(),
        };

        console.log("Video update data:", updateData);

        // Add timeout to prevent hanging
        const updatePromise = supabase
          .from("educational_videos")
          .update(updateData)
          .eq("id", video.id);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error("Video update operation timed out after 10 seconds")
              ),
            10000
          );
        });

        console.log("Executing video update query...");
        const { error } = (await Promise.race([
          updatePromise,
          timeoutPromise,
        ])) as any;

        if (error) {
          console.error("Supabase video update error:", error);
          throw error;
        }

        console.log("Video update operation completed successfully");

        // Separately fetch the updated record to confirm it was updated
        const { data: updatedRecord, error: fetchError } = await supabase
          .from("educational_videos")
          .select("*")
          .eq("id", video.id)
          .single();

        if (fetchError) {
          console.warn("Could not fetch updated video record:", fetchError);
        } else {
          console.log("Updated video record:", updatedRecord);
        }

        alert("Video berhasil diperbarui!");
      } else {
        // Create new video
        console.log("CREATING new video");
        const insertData = {
          title: video.title,
          description: video.description,
          video_url: video.video_url,
          thumbnail_url: video.thumbnail_url,
          category: video.category,
          duration: video.duration,
          is_featured: video.is_featured,
          created_by: user.id,
        };

        console.log("Video insert data:", insertData);

        // Add timeout to prevent hanging
        const insertPromise = supabase
          .from("educational_videos")
          .insert(insertData);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error("Video insert operation timed out after 10 seconds")
              ),
            10000
          );
        });

        console.log("Executing video insert query...");
        const { error } = (await Promise.race([
          insertPromise,
          timeoutPromise,
        ])) as any;

        if (error) {
          console.error("Supabase video insert error:", error);
          throw error;
        }

        console.log("Video insert operation completed successfully");
        alert("Video berhasil ditambahkan!");
      }

      setEditingVideo(null);
      setShowNewVideoForm(false);
      fetchData();
    } catch (error: any) {
      console.error("Error saving video:", error);

      // Show detailed error message
      let errorMessage = "Terjadi kesalahan saat menyimpan video";

      if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      if (error.code) {
        errorMessage += ` (Code: ${error.code})`;
      }

      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus materi ini?")) return;

    try {
      const { error } = await supabase
        .from("content_materials")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus video ini?")) return;

    try {
      const { error } = await supabase
        .from("educational_videos")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("content_materials")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error updating publish status:", error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Akses Ditolak
          </h2>
          <p className="text-gray-600 mb-4">
            Anda tidak memiliki izin untuk mengakses halaman admin.
          </p>
          <Button asChild>
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    );
  }

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
                <Link href="/materi">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Materi
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">
                Kelola Konten
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="materials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="materials" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Materi Edukasi
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center">
              <Video className="h-4 w-4 mr-2" />
              Video Edukasi
            </TabsTrigger>
          </TabsList>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Materi Edukasi</h2>
              <Button
                onClick={() => {
                  console.log("Tambah Materi clicked - resetting state");
                  setEditingMaterial(null);
                  setShowNewMaterialForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Materi
              </Button>
            </div>

            {/* Materials List */}
            <div className="grid gap-4">
              {materials.map((material) => (
                <Card key={material.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{material.title}</h3>
                          <Badge
                            variant={
                              material.is_published ? "default" : "secondary"
                            }
                          >
                            {material.is_published ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline">{material.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {material.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Slug: {material.slug}</span>
                          <span>
                            Dibuat:{" "}
                            {new Date(material.created_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            togglePublishStatus(
                              material.id,
                              material.is_published
                            )
                          }
                        >
                          {material.is_published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMaterial(material)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMaterial(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Video Edukasi</h2>
              <Button
                onClick={() => {
                  console.log("Tambah Video clicked - resetting state");
                  setEditingVideo(null);
                  setShowNewVideoForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Video
              </Button>
            </div>

            {/* Videos List */}
            <div className="grid gap-4">
              {videos.map((video) => (
                <Card key={video.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{video.title}</h3>
                          {video.is_featured && <Badge>Featured</Badge>}
                          <Badge variant="outline">{video.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {video.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Durasi: {video.duration || "N/A"}</span>
                          <span>Views: {video.view_count}</span>
                          <span>
                            Dibuat:{" "}
                            {new Date(video.created_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log("Edit video clicked for:", video.title);
                            setEditingVideo(video);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVideo(video.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Material Edit/Create Form */}
        {(editingMaterial || showNewMaterialForm) && (
          <MaterialForm
            material={editingMaterial} // null for new material, object for editing
            onSave={handleSaveMaterial}
            onCancel={() => {
              console.log("Cancel clicked - resetting state");
              setEditingMaterial(null);
              setShowNewMaterialForm(false);
            }}
            saving={saving}
          />
        )}

        {/* Video Edit/Create Form */}
        {(editingVideo || showNewVideoForm) && (
          <VideoForm
            video={editingVideo} // null for new video, object for editing
            onSave={handleSaveVideo}
            onCancel={() => {
              console.log("Video Cancel clicked - resetting state");
              setEditingVideo(null);
              setShowNewVideoForm(false);
            }}
            saving={saving}
          />
        )}
      </main>
    </div>
  );
}

// Material Form Component
function MaterialForm({
  material,
  onSave,
  onCancel,
  saving,
}: {
  material: ContentMaterial | null;
  onSave: (material: Partial<ContentMaterial>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    description: "",
    content: "",
    category: "gizi",
    read_time: "5 menit",
    topics: "",
    video_url: "",
    video_title: "",
    video_description: "",
    is_published: true,
  });

  // Use useEffect to populate form when material changes
  useEffect(() => {
    console.log("MaterialForm useEffect triggered with material:", material);
    console.log("Is editing mode:", !!material);

    if (material) {
      // Editing existing material
      setFormData({
        slug: material.slug || "",
        title: material.title || "",
        description: material.description || "",
        content: material.content || "",
        category: material.category || "gizi",
        read_time: material.read_time || "5 menit",
        topics: material.topics?.join(", ") || "",
        video_url: material.video_url || "",
        video_title: material.video_title || "",
        video_description: material.video_description || "",
        is_published: material.is_published ?? true,
      });
    } else {
      // Creating new material - reset form
      setFormData({
        slug: "",
        title: "",
        description: "",
        content: "",
        category: "gizi",
        read_time: "5 menit",
        topics: "",
        video_url: "",
        video_title: "",
        video_description: "",
        is_published: true,
      });
    }
  }, [material]); // Only re-run when material prop changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim()) {
      alert("Judul wajib diisi!");
      return;
    }

    if (!formData.slug.trim()) {
      alert("Slug wajib diisi!");
      return;
    }

    if (!formData.content.trim()) {
      alert("Konten wajib diisi!");
      return;
    }

    // Prepare material data
    const materialData = {
      // Only include ID if we're editing existing material
      ...(material?.id ? { id: material.id } : {}),
      slug: formData.slug.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      content: formData.content.trim(),
      category: formData.category,
      read_time: formData.read_time,
      topics: formData.topics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      video_url: formData.video_url.trim() || null,
      video_title: formData.video_title.trim() || null,
      video_description: formData.video_description.trim() || null,
      is_published: formData.is_published,
    };

    console.log("Form material prop:", material);
    console.log("Is editing:", !!material?.id);
    console.log("Submitting material data:", materialData);
    onSave(materialData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {material ? "Edit Materi" : "Tambah Materi Baru"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Judul</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Kategori</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="gizi">Gizi</option>
                  <option value="gigi">Kesehatan Gigi</option>
                  <option value="sanitasi">Sanitasi</option>
                </select>
              </div>
              <div>
                <Label htmlFor="read_time">Waktu Baca</Label>
                <Input
                  id="read_time"
                  value={formData.read_time}
                  onChange={(e) =>
                    setFormData({ ...formData, read_time: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) =>
                    setFormData({ ...formData, is_published: e.target.checked })
                  }
                />
                <Label htmlFor="is_published">Publikasikan</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="topics">Topik (pisahkan dengan koma)</Label>
              <Input
                id="topics"
                value={formData.topics}
                onChange={(e) =>
                  setFormData({ ...formData, topics: e.target.value })
                }
                placeholder="Topik 1, Topik 2, Topik 3"
              />
            </div>

            <div>
              <Label htmlFor="content">Konten (Markdown)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={10}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="video_url">URL Video (opsional)</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) =>
                    setFormData({ ...formData, video_url: e.target.value })
                  }
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <Label htmlFor="video_title">Judul Video</Label>
                <Input
                  id="video_title"
                  value={formData.video_title}
                  onChange={(e) =>
                    setFormData({ ...formData, video_title: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="video_description">Deskripsi Video</Label>
              <Textarea
                id="video_description"
                value={formData.video_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    video_description: e.target.value,
                  })
                }
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Simpan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Video Form Component
function VideoForm({
  video,
  onSave,
  onCancel,
  saving,
}: {
  video: EducationalVideo | null;
  onSave: (video: Partial<EducationalVideo>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    category: "gizi",
    duration: "",
    is_featured: false,
  });

  // Use useEffect to populate form when video changes
  useEffect(() => {
    console.log("VideoForm useEffect triggered with video:", video);
    console.log("Is editing video mode:", !!video);

    if (video) {
      // Editing existing video
      setFormData({
        title: video.title || "",
        description: video.description || "",
        video_url: video.video_url || "",
        thumbnail_url: video.thumbnail_url || "",
        category: video.category || "gizi",
        duration: video.duration || "",
        is_featured: video.is_featured || false,
      });
    } else {
      // Creating new video - reset form
      setFormData({
        title: "",
        description: "",
        video_url: "",
        thumbnail_url: "",
        category: "gizi",
        duration: "",
        is_featured: false,
      });
    }
  }, [video]); // Only re-run when video prop changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim()) {
      alert("Judul video wajib diisi!");
      return;
    }

    if (!formData.video_url.trim()) {
      alert("URL video wajib diisi!");
      return;
    }

    // Prepare video data
    const videoData = {
      // Only include ID if we're editing existing video
      ...(video?.id ? { id: video.id } : {}),
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      video_url: formData.video_url.trim(),
      thumbnail_url: formData.thumbnail_url.trim() || null,
      category: formData.category,
      duration: formData.duration.trim() || null,
      is_featured: formData.is_featured,
    };

    console.log("Form video prop:", video);
    console.log("Is editing video:", !!video?.id);
    console.log("Submitting video data:", videoData);
    onSave(videoData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{video ? "Edit Video" : "Tambah Video Baru"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Judul Video</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="video_url">URL Video</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) =>
                  setFormData({ ...formData, video_url: e.target.value })
                }
                placeholder="https://youtube.com/watch?v=..."
                required
              />
            </div>

            <div>
              <Label htmlFor="thumbnail_url">URL Thumbnail (opsional)</Label>
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnail_url: e.target.value })
                }
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Kategori</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="gizi">Gizi</option>
                  <option value="gigi">Kesehatan Gigi</option>
                  <option value="sanitasi">Sanitasi</option>
                </select>
              </div>
              <div>
                <Label htmlFor="duration">Durasi</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="5:30"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
              />
              <Label htmlFor="is_featured">Video Unggulan</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Simpan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminContentPage() {
  return (
    <ProtectedRoute>
      <AdminContentPageContent />
    </ProtectedRoute>
  );
}

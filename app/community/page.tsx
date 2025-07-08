"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Trophy,
  Clock,
  MapPin,
  Calendar,
  Loader2,
  Plus,
  Star,
  X,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Settings,
} from "lucide-react";

interface DiscussionGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  moderator_id: string | null;
  member_count: number;
  post_count: number;
  created_at: string;
  isUserMember?: boolean;
}

interface Post {
  id: string;
  author_id: string;
  group_id: string | null;
  title: string;
  content: string;
  post_type: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
  };
  discussion_groups?: {
    name: string;
  };
  isLiked?: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string;
  location: string;
  event_type: string;
  max_attendees: number | null;
  attendee_count: number;
  created_by: string;
  created_at: string;
  isUserRegistered?: boolean;
}

function CommunityPageContent() {
  const [discussionGroups, setDiscussionGroups] = useState<DiscussionGroup[]>(
    []
  );
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState("discussion");
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  // New group form
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState("gizi");

  // New event form
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventType, setNewEventType] = useState("edukasi");
  const [newEventMaxAttendees, setNewEventMaxAttendees] = useState("");

  const { user, isAdmin } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setError("");

      // Fetch discussion groups
      const { data: groups, error: groupsError } = await supabase
        .from("discussion_groups")
        .select("*")
        .order("member_count", { ascending: false });

      if (groupsError) {
        console.error("Error fetching groups:", groupsError);
      } else if (groups) {
        // Check which groups the user is a member of
        if (user) {
          const groupsWithMembership = await Promise.all(
            groups.map(async (group) => {
              const { data: isMember } = await supabase.rpc(
                "is_user_in_group",
                {
                  user_id: user.id,
                  group_id: group.id,
                }
              );
              return { ...group, isUserMember: isMember };
            })
          );
          setDiscussionGroups(groupsWithMembership);
        } else {
          setDiscussionGroups(groups);
        }
      }

      // Fetch recent posts with author profiles and group names
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          *,
          profiles!posts_author_id_fkey(name, avatar_url),
          discussion_groups(name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (postsError) {
        console.error("Error fetching posts:", postsError);
      } else if (posts) {
        // Check which posts the user has liked
        if (user) {
          const postsWithLikes = await Promise.all(
            posts.map(async (post) => {
              const { data: likes } = await supabase
                .from("post_likes")
                .select("id")
                .eq("post_id", post.id)
                .eq("user_id", user.id)
                .single();
              return { ...post, isLiked: !!likes };
            })
          );
          setRecentPosts(postsWithLikes);
        } else {
          setRecentPosts(posts);
        }
      }

      // Fetch upcoming events
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true })
        .limit(6);

      if (eventsError) {
        console.error("Error fetching events:", eventsError);
      } else if (events) {
        // Check which events the user is registered for
        if (user) {
          const eventsWithRegistration = await Promise.all(
            events.map(async (event) => {
              const { data: isRegistered } = await supabase.rpc(
                "is_user_registered_for_event",
                {
                  user_id: user.id,
                  event_id: event.id,
                }
              );
              return { ...event, isUserRegistered: isRegistered };
            })
          );
          setUpcomingEvents(eventsWithRegistration);
        } else {
          setUpcomingEvents(events);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Gagal memuat data komunitas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPostTitle.trim() || !newPostContent.trim()) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const { error: postError } = await supabase.from("posts").insert({
        author_id: user.id,
        group_id: selectedGroup || null,
        title: newPostTitle,
        content: newPostContent,
        post_type: newPostType,
      });

      if (postError) throw postError;

      // Update user stats
      try {
        await supabase.rpc("update_user_stats", {
          user_id: user.id,
          activity_type: "community_post",
          points: 75,
        });

        // Log activity
        await supabase.from("activity_log").insert({
          user_id: user.id,
          activity_type: "community_post",
          activity_title: `Memposting: "${newPostTitle}"`,
          points_earned: 75,
        });

        // Update streak and check badges
        await supabase.rpc("update_user_streak", { user_id: user.id });
        await supabase.rpc("check_and_award_badges", { user_id: user.id });
      } catch (statsError) {
        console.error("Error updating stats:", statsError);
        // Don't fail the whole operation for stats errors
      }

      // Reset form
      setNewPostTitle("");
      setNewPostContent("");
      setSelectedGroup("");
      setNewPostType("discussion");
      setShowNewPostForm(false);
      setSuccess("Postingan berhasil dibuat!");

      // Refresh posts
      fetchData();
    } catch (error: any) {
      console.error("Error creating post:", error);
      setError(error.message || "Gagal membuat postingan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newGroupName.trim() || !newGroupDescription.trim()) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const { data, error: groupError } = await supabase
        .from("discussion_groups")
        .insert({
          name: newGroupName,
          description: newGroupDescription,
          category: newGroupCategory,
          moderator_id: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Auto-join the creator to the group
      if (data) {
        try {
          await supabase.from("group_members").insert({
            group_id: data.id,
            user_id: user.id,
          });

          // Update group member count
          await supabase.rpc("increment_group_members", { group_id: data.id });
        } catch (memberError) {
          console.error("Error joining group:", memberError);
          // Don't fail the whole operation
        }
      }

      // Reset form
      setNewGroupName("");
      setNewGroupDescription("");
      setNewGroupCategory("gizi");
      setShowNewGroupForm(false);
      setSuccess("Grup diskusi berhasil dibuat!");

      // Refresh data
      fetchData();
    } catch (error: any) {
      console.error("Error creating group:", error);
      setError(error.message || "Gagal membuat grup diskusi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !user ||
      !newEventTitle.trim() ||
      !newEventDate ||
      !newEventTime ||
      !newEventLocation.trim()
    )
      return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const { error: eventError } = await supabase.from("events").insert({
        title: newEventTitle,
        description: newEventDescription || null,
        event_date: newEventDate,
        event_time: newEventTime,
        location: newEventLocation,
        event_type: newEventType,
        max_attendees: newEventMaxAttendees
          ? Number.parseInt(newEventMaxAttendees)
          : null,
        created_by: user.id,
      });

      if (eventError) throw eventError;

      // Reset form
      setNewEventTitle("");
      setNewEventDescription("");
      setNewEventDate("");
      setNewEventTime("");
      setNewEventLocation("");
      setNewEventType("edukasi");
      setNewEventMaxAttendees("");
      setShowNewEventForm(false);
      setSuccess("Acara berhasil dibuat!");

      // Refresh data
      fetchData();
    } catch (error: any) {
      console.error("Error creating event:", error);
      setError(error.message || "Gagal membuat acara");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    try {
      const post = recentPosts.find((p) => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        // Unlike
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        await supabase.rpc("decrement_post_likes", { post_id: postId });
      } else {
        // Like
        await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });
        await supabase.rpc("increment_post_likes", { post_id: postId });
      }

      // Refresh posts
      fetchData();
    } catch (error) {
      console.error("Error toggling like:", error);
      setError("Gagal mengubah status like");
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      await supabase
        .from("group_members")
        .insert({ group_id: groupId, user_id: user.id });
      await supabase.rpc("increment_group_members", { group_id: groupId });
      setSuccess("Berhasil bergabung dengan grup!");
      fetchData();
    } catch (error: any) {
      console.error("Error joining group:", error);
      if (error.code === "23505") {
        // Unique constraint violation
        setError("Anda sudah menjadi anggota grup ini");
      } else {
        setError("Gagal bergabung dengan grup");
      }
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user || !confirm("Apakah Anda yakin ingin keluar dari grup ini?"))
      return;

    try {
      await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

      // Decrement member count
      await supabase
        .from("discussion_groups")
        .update({
          member_count: Math.max(
            0,
            discussionGroups.find((g) => g.id === groupId)?.member_count! - 1
          ),
        })
        .eq("id", groupId);

      setSuccess("Berhasil keluar dari grup!");
      fetchData();
    } catch (error) {
      console.error("Error leaving group:", error);
      setError("Gagal keluar dari grup");
    }
  };

  const registerForEvent = async (eventId: string) => {
    if (!user) return;

    try {
      await supabase
        .from("event_attendees")
        .insert({ event_id: eventId, user_id: user.id });
      await supabase.rpc("increment_event_attendees", { event_id: eventId });
      setSuccess("Berhasil mendaftar acara!");
      fetchData();
    } catch (error: any) {
      console.error("Error registering for event:", error);
      if (error.code === "23505") {
        setError("Anda sudah terdaftar untuk acara ini");
      } else {
        setError("Gagal mendaftar acara");
      }
    }
  };

  const unregisterFromEvent = async (eventId: string) => {
    if (!user || !confirm("Apakah Anda yakin ingin membatalkan pendaftaran?"))
      return;

    try {
      await supabase
        .from("event_attendees")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      // Decrement attendee count
      await supabase
        .from("events")
        .update({
          attendee_count: Math.max(
            0,
            upcomingEvents.find((e) => e.id === eventId)?.attendee_count! - 1
          ),
        })
        .eq("id", eventId);

      setSuccess("Pendaftaran berhasil dibatalkan!");
      fetchData();
    } catch (error) {
      console.error("Error unregistering from event:", error);
      setError("Gagal membatalkan pendaftaran");
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
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-pink-500" />
                <h1 className="text-xl font-bold text-gray-800">
                  Komunitas SehatKeluarga
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/dashboard">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/profile">Profil Saya</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
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

        <Tabs defaultValue="discussions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discussions">Diskusi</TabsTrigger>
            <TabsTrigger value="events">Acara</TabsTrigger>
            <TabsTrigger value="create">Buat Konten</TabsTrigger>
            <TabsTrigger value="success-stories">Cerita Sukses</TabsTrigger>
          </TabsList>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-6">
            {/* Discussion Groups */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Grup Diskusi
                </h2>
                <Button onClick={() => setShowNewGroupForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Grup
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {discussionGroups.map((group) => (
                  <Card
                    key={group.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <Badge variant="secondary">{group.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {group.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{group.member_count} anggota</span>
                          <span>{group.post_count} postingan</span>
                        </div>
                        {group.isUserMember ? (
                          <div className="flex items-center space-x-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Anggota
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => leaveGroup(group.id)}
                            >
                              Keluar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="w-full mt-3"
                            size="sm"
                            onClick={() => joinGroup(group.id)}
                          >
                            Gabung Diskusi
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Postingan Terbaru</h3>
                <Button onClick={() => setShowNewPostForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Post
                </Button>
              </div>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar>
                          <AvatarImage
                            src={post.profiles.avatar_url || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {post.profiles.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">
                              {post.profiles.name}
                            </span>
                            {post.discussion_groups && (
                              <>
                                <span className="text-sm text-gray-500">
                                  di
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {post.discussion_groups.name}
                                </Badge>
                              </>
                            )}
                            {post.post_type === "success_story" && (
                              <Badge className="bg-green-500">
                                <Star className="h-3 w-3 mr-1" />
                                Cerita Sukses
                              </Badge>
                            )}
                            <span className="text-sm text-gray-400">
                              {new Date(post.created_at).toLocaleDateString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                          <h4 className="font-semibold mb-2">{post.title}</h4>
                          <p className="text-gray-700 mb-3">{post.content}</p>
                          {post.tags.length > 0 && (
                            <div className="flex items-center space-x-2 mb-3">
                              {post.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikePost(post.id)}
                              className={post.isLiked ? "text-red-500" : ""}
                            >
                              <Heart
                                className={`h-4 w-4 mr-1 ${
                                  post.isLiked ? "fill-current" : ""
                                }`}
                              />
                              {post.likes_count}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post.comments_count}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="h-4 w-4 mr-1" />
                              Bagikan
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Acara Mendatang
              </h2>
              <Button onClick={() => setShowNewEventForm(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Buat Acara
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {upcomingEvents.map((event) => (
                <Card
                  key={event.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <Badge
                        variant={
                          event.event_type === "posyandu"
                            ? "default"
                            : event.event_type === "edukasi"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {event.event_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.event_date).toLocaleDateString(
                          "id-ID",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {event.event_time}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-500">
                          {event.attendee_count} akan hadir
                          {event.max_attendees && ` / ${event.max_attendees}`}
                        </span>
                        {event.isUserRegistered ? (
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <UserCheck className="h-4 w-4 mr-2" />
                              Terdaftar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unregisterFromEvent(event.id)}
                            >
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => registerForEvent(event.id)}
                            disabled={
                              event.max_attendees
                                ? event.attendee_count >= event.max_attendees
                                : false
                            }
                          >
                            {event.max_attendees &&
                            event.attendee_count >= event.max_attendees
                              ? "Penuh"
                              : "Ikut Acara"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Create Content Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setShowNewPostForm(true)}
              >
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Buat Postingan</h3>
                  <p className="text-sm text-gray-600">
                    Bagikan pengalaman, tips, atau ajukan pertanyaan
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setShowNewGroupForm(true)}
              >
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Buat Grup Diskusi</h3>
                  <p className="text-sm text-gray-600">
                    Mulai komunitas baru untuk topik tertentu
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setShowNewEventForm(true)}
              >
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Buat Acara</h3>
                  <p className="text-sm text-gray-600">
                    Organisir kegiatan edukasi atau posyandu
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Success Stories Tab */}
          <TabsContent value="success-stories" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Cerita Sukses
              </h2>
              <Button
                onClick={() => {
                  setNewPostType("success_story");
                  setShowNewPostForm(true);
                }}
                size="sm"
              >
                <Star className="h-4 w-4 mr-2" />
                Bagikan Cerita
              </Button>
            </div>

            <div className="grid gap-4">
              {recentPosts
                .filter((post) => post.post_type === "success_story")
                .map((post) => (
                  <Card key={post.id} className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar>
                          <AvatarImage
                            src={post.profiles.avatar_url || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {post.profiles.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">
                              {post.profiles.name}
                            </span>
                            <Badge className="bg-green-500">
                              <Star className="h-3 w-3 mr-1" />
                              Cerita Sukses
                            </Badge>
                            <span className="text-sm text-gray-400">
                              {new Date(post.created_at).toLocaleDateString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                          <h4 className="font-semibold mb-2">{post.title}</h4>
                          <p className="text-gray-700 mb-3">{post.content}</p>
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikePost(post.id)}
                              className={post.isLiked ? "text-red-500" : ""}
                            >
                              <Heart
                                className={`h-4 w-4 mr-1 text-red-500 ${
                                  post.isLiked ? "fill-current" : ""
                                }`}
                              />
                              {post.likes_count}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post.comments_count}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                              Inspiratif
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* New Post Form Modal */}
        {showNewPostForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {newPostType === "success_story"
                      ? "Bagikan Cerita Sukses"
                      : "Buat Postingan Baru"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewPostForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-type">Jenis Postingan</Label>
                    <select
                      id="post-type"
                      value={newPostType}
                      onChange={(e) => setNewPostType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="discussion">Diskusi</option>
                      <option value="success_story">Cerita Sukses</option>
                      <option value="recipe">Resep Sehat</option>
                      <option value="event">Pengumuman Acara</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group">Grup (Opsional)</Label>
                    <select
                      id="group"
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Pilih grup...</option>
                      {discussionGroups
                        .filter((group) => group.isUserMember)
                        .map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Judul</Label>
                    <Input
                      id="title"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder={
                        newPostType === "success_story"
                          ? "Cerita sukses saya tentang..."
                          : "Tulis judul postingan..."
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Konten</Label>
                    <Textarea
                      id="content"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={
                        newPostType === "success_story"
                          ? "Bagikan pengalaman sukses Anda dalam menjaga kesehatan keluarga..."
                          : "Bagikan pengalaman, tips, atau pertanyaan Anda..."
                      }
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewPostForm(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Posting
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Group Form Modal */}
        {showNewGroupForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Buat Grup Diskusi Baru</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewGroupForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Nama Grup</Label>
                    <Input
                      id="group-name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Nama grup diskusi..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-description">Deskripsi</Label>
                    <Textarea
                      id="group-description"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="Jelaskan tujuan dan topik diskusi grup..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-category">Kategori</Label>
                    <select
                      id="group-category"
                      value={newGroupCategory}
                      onChange={(e) => setNewGroupCategory(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="gizi">Gizi & Nutrisi</option>
                      <option value="gigi">Kesehatan Gigi</option>
                      <option value="sanitasi">Sanitasi & Kebersihan</option>
                      <option value="kehamilan">Kehamilan & Persalinan</option>
                      <option value="parenting">Parenting</option>
                      <option value="mental">Kesehatan Mental</option>
                      <option value="olahraga">Olahraga & Aktivitas</option>
                      <option value="resep">Resep & Masakan</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewGroupForm(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Buat Grup
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Event Form Modal */}
        {showNewEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Buat Acara Baru</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewEventForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Judul Acara</Label>
                    <Input
                      id="event-title"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      placeholder="Nama acara..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-description">
                      Deskripsi (Opsional)
                    </Label>
                    <Textarea
                      id="event-description"
                      value={newEventDescription}
                      onChange={(e) => setNewEventDescription(e.target.value)}
                      placeholder="Jelaskan detail acara..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-date">Tanggal</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-time">Waktu</Label>
                      <Input
                        id="event-time"
                        value={newEventTime}
                        onChange={(e) => setNewEventTime(e.target.value)}
                        placeholder="08:00 - 12:00"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-location">Lokasi</Label>
                    <Input
                      id="event-location"
                      value={newEventLocation}
                      onChange={(e) => setNewEventLocation(e.target.value)}
                      placeholder="Alamat lengkap acara..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-type">Jenis Acara</Label>
                      <select
                        id="event-type"
                        value={newEventType}
                        onChange={(e) => setNewEventType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="edukasi">Edukasi</option>
                        <option value="posyandu">Posyandu</option>
                        <option value="olahraga">Olahraga</option>
                        <option value="workshop">Workshop</option>
                        <option value="seminar">Seminar</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-max-attendees">
                        Maks. Peserta (Opsional)
                      </Label>
                      <Input
                        id="event-max-attendees"
                        type="number"
                        value={newEventMaxAttendees}
                        onChange={(e) =>
                          setNewEventMaxAttendees(e.target.value)
                        }
                        placeholder="50"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewEventForm(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Buat Acara
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CommunityPage() {
  return <CommunityPageContent />;
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Trophy,
  Star,
  Target,
  Flame,
  Award,
  Users,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface UserStats {
  id: string;
  user_id: string;
  level: number;
  current_xp: number;
  total_points: number;
  streak_days: number;
  last_activity_date: string;
  articles_read: number;
  questions_asked: number;
  community_posts: number;
  helpful_answers: number;
}

interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  earned?: boolean;
  earned_at?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  challenge_type: string;
  icon: string;
  completed?: boolean;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar_url: string | null;
  total_points: number;
  isCurrentUser?: boolean;
}

interface Activity {
  id: string;
  activity_type: string;
  activity_title: string;
  points_earned: number;
  created_at: string;
}

function GamificationPageContent() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, profile } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user stats
      const { data: stats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (stats) setUserStats(stats);

      // Fetch badges with user's earned badges
      const { data: allBadges } = await supabase
        .from("badges")
        .select("*")
        .order("points_required", { ascending: true });

      const { data: userBadgeData } = await supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", user.id);

      if (allBadges) {
        const badgesWithStatus = allBadges.map((badge) => ({
          ...badge,
          earned:
            userBadgeData?.some((ub) => ub.badge_id === badge.id) || false,
          earned_at: userBadgeData?.find((ub) => ub.badge_id === badge.id)
            ?.earned_at,
        }));
        setUserBadges(badgesWithStatus);
      }

      // Fetch daily challenges with completion status
      const { data: allChallenges } = await supabase
        .from("daily_challenges")
        .select("*")
        .eq("is_active", true);

      const today = new Date().toISOString().split("T")[0];
      const { data: completedChallenges } = await supabase
        .from("user_challenge_completions")
        .select("challenge_id")
        .eq("user_id", user.id)
        .eq("completed_date", today);

      if (allChallenges) {
        const challengesWithStatus = allChallenges.map((challenge) => ({
          ...challenge,
          completed:
            completedChallenges?.some(
              (cc) => cc.challenge_id === challenge.id
            ) || false,
        }));
        setChallenges(challengesWithStatus);
      }

      // Fetch leaderboard
      const { data: leaderboardData } = await supabase
        .from("user_stats")
        .select(
          `
          user_id,
          total_points
        `
        )
        .order("total_points", { ascending: false })
        .limit(20);

      if (leaderboardData) {
        // Fetch profile data for each user
        const userIds = leaderboardData.map((entry) => entry.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .in("id", userIds);

        const formattedLeaderboard = leaderboardData.map((entry, index) => {
          const profile = profilesData?.find((p) => p.id === entry.user_id);
          return {
            rank: index + 1,
            user_id: entry.user_id,
            name: profile?.name || "Unknown",
            avatar_url: profile?.avatar_url || null,
            total_points: entry.total_points,
            isCurrentUser: entry.user_id === user.id,
          };
        });
        setLeaderboard(formattedLeaderboard);
      }

      // Fetch recent activities
      const { data: activities } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (activities) setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeChallenge = async (challengeId: string, points: number) => {
    if (!user) return;

    try {
      // Mark challenge as completed
      await supabase.from("user_challenge_completions").insert({
        user_id: user.id,
        challenge_id: challengeId,
        points_earned: points,
      });

      // Update user stats
      await supabase.rpc("update_user_stats", {
        user_id: user.id,
        activity_type: "challenge_completed",
        points: points,
      });

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        activity_type: "challenge_completed",
        activity_title: `Menyelesaikan tantangan harian`,
        points_earned: points,
      });

      // Check for new badges
      await supabase.rpc("check_and_award_badges", { user_id: user.id });

      // Refresh data
      fetchUserData();
    } catch (error) {
      console.error("Error completing challenge:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Gagal memuat data pengguna</p>
          <Button onClick={fetchUserData} className="mt-4">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  const nextLevelXP = userStats.level * 300; // Simple XP calculation
  const progressPercentage = (userStats.current_xp / nextLevelXP) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-white hover:bg-white/20"
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6" />
                <h1 className="text-xl font-bold">Pencapaian Saya</h1>
              </div>
            </div>
          </div>

          {/* User Stats Header */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{userStats.level}</div>
              <div className="text-sm opacity-90">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {userStats.total_points.toLocaleString()}
              </div>
              <div className="text-sm opacity-90">Total Poin</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold flex items-center justify-center">
                <Flame className="h-5 w-5 mr-1 text-orange-300" />
                {userStats.streak_days}
              </div>
              <div className="text-sm opacity-90">Hari Berturut</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                #
                {leaderboard.find((entry) => entry.isCurrentUser)?.rank ||
                  "N/A"}
              </div>
              <div className="text-sm opacity-90">Peringkat</div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="challenges">Tantangan</TabsTrigger>
            <TabsTrigger value="badges">Badge</TabsTrigger>
            <TabsTrigger value="leaderboard">Peringkat</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Progress Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Level {userStats.level}
                    </span>
                    <span className="text-sm text-gray-500">
                      {userStats.current_xp} / {nextLevelXP} XP
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <p className="text-sm text-gray-600">
                    {nextLevelXP - userStats.current_xp} XP lagi untuk naik ke
                    Level {userStats.level + 1}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-purple-500" />
                  Aktivitas Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {activity.activity_title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <UIBadge variant="secondary">
                            +{activity.points_earned} poin
                          </UIBadge>
                          <span className="text-xs text-gray-400">
                            {new Date(activity.created_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userBadges.filter((b) => b.earned).length}
                  </div>
                  <div className="text-sm text-gray-600">Badge Diraih</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userStats.articles_read}
                  </div>
                  <div className="text-sm text-gray-600">Artikel Dibaca</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {userStats.questions_asked}
                  </div>
                  <div className="text-sm text-gray-600">Pertanyaan AI</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-500" />
                  Tantangan Harian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {challenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className={`flex items-center space-x-3 p-4 rounded-lg border ${
                        challenge.completed
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div
                        className={`text-2xl ${
                          challenge.completed ? "grayscale-0" : "grayscale"
                        }`}
                      >
                        {challenge.icon}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-semibold ${
                            challenge.completed
                              ? "text-green-800"
                              : "text-gray-800"
                          }`}
                        >
                          {challenge.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {challenge.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <UIBadge
                            variant={
                              challenge.completed ? "default" : "secondary"
                            }
                          >
                            +{challenge.points} poin
                          </UIBadge>
                          {challenge.completed && (
                            <UIBadge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Selesai
                            </UIBadge>
                          )}
                        </div>
                      </div>
                      {!challenge.completed && (
                        <Button
                          size="sm"
                          onClick={() =>
                            completeChallenge(challenge.id, challenge.points)
                          }
                        >
                          Mulai
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userBadges.map((badge) => (
                <Card
                  key={badge.id}
                  className={`${
                    badge.earned
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`text-4xl mb-3 ${
                        badge.earned ? "" : "grayscale opacity-50"
                      }`}
                    >
                      {badge.icon}
                    </div>
                    <h4
                      className={`font-semibold mb-2 ${
                        badge.earned ? "text-yellow-800" : "text-gray-600"
                      }`}
                    >
                      {badge.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {badge.description}
                    </p>

                    {badge.earned ? (
                      <div className="space-y-2">
                        <UIBadge className="bg-yellow-500">Diraih</UIBadge>
                        {badge.earned_at && (
                          <p className="text-xs text-gray-500">
                            Diraih pada{" "}
                            {new Date(badge.earned_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UIBadge variant="outline">Belum Diraih</UIBadge>
                        <p className="text-xs text-gray-500">
                          Butuh {badge.points_required} poin
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Papan Peringkat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.map((user) => (
                    <div
                      key={user.user_id}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        user.isCurrentUser
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-8 text-center font-bold text-gray-600">
                        {user.rank <= 3
                          ? user.rank === 1
                            ? "🥇"
                            : user.rank === 2
                            ? "🥈"
                            : "🥉"
                          : `#${user.rank}`}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.avatar_url || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span
                          className={`font-medium ${
                            user.isCurrentUser
                              ? "text-blue-700"
                              : "text-gray-800"
                          }`}
                        >
                          {user.name} {user.isCurrentUser && "(Anda)"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">
                          {user.total_points.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">poin</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function GamificationPage() {
  return <GamificationPageContent />;
}

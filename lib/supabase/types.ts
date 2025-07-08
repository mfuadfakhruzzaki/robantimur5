export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          phone: string | null
          village: string | null
          bio: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          avatar_url?: string | null
          phone?: string | null
          village?: string | null
          bio?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          phone?: string | null
          village?: string | null
          bio?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_materials: {
        Row: {
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
          is_published: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          content: string
          category: string
          read_time?: string | null
          topics?: string[]
          video_url?: string | null
          video_title?: string | null
          video_description?: string | null
          is_published?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          content?: string
          category?: string
          read_time?: string | null
          topics?: string[]
          video_url?: string | null
          video_title?: string | null
          video_description?: string | null
          is_published?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      educational_videos: {
        Row: {
          id: string
          title: string
          description: string | null
          video_url: string
          thumbnail_url: string | null
          category: string
          duration: string | null
          is_featured: boolean
          view_count: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          video_url: string
          thumbnail_url?: string | null
          category: string
          duration?: string | null
          is_featured?: boolean
          view_count?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          video_url?: string
          thumbnail_url?: string | null
          category?: string
          duration?: string | null
          is_featured?: boolean
          view_count?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          level: number
          current_xp: number
          total_points: number
          streak_days: number
          last_activity_date: string
          articles_read: number
          questions_asked: number
          community_posts: number
          helpful_answers: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          level?: number
          current_xp?: number
          total_points?: number
          streak_days?: number
          last_activity_date?: string
          articles_read?: number
          questions_asked?: number
          community_posts?: number
          helpful_answers?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          level?: number
          current_xp?: number
          total_points?: number
          streak_days?: number
          last_activity_date?: string
          articles_read?: number
          questions_asked?: number
          community_posts?: number
          helpful_answers?: number
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          group_id: string | null
          title: string
          content: string
          post_type: string
          tags: string[]
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          group_id?: string | null
          title: string
          content: string
          post_type?: string
          tags?: string[]
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          group_id?: string | null
          title?: string
          content?: string
          post_type?: string
          tags?: string[]
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      discussion_groups: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          moderator_id: string | null
          member_count: number
          post_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          moderator_id?: string | null
          member_count?: number
          post_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          moderator_id?: string | null
          member_count?: number
          post_count?: number
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          event_time: string
          location: string
          event_type: string
          max_attendees: number | null
          attendee_count: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          event_time: string
          location: string
          event_type: string
          max_attendees?: number | null
          attendee_count?: number
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string
          event_time?: string
          location?: string
          event_type?: string
          max_attendees?: number | null
          attendee_count?: number
          created_by?: string
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          points_required: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          points_required?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          points_required?: number
          created_at?: string
        }
      }
      daily_challenges: {
        Row: {
          id: string
          title: string
          description: string
          points: number
          challenge_type: string
          icon: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          points: number
          challenge_type: string
          icon: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          points?: number
          challenge_type?: string
          icon?: string
          is_active?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_user_stats: {
        Args: {
          user_id: string
          activity_type: string
          points?: number
        }
        Returns: void
      }
      check_and_award_badges: {
        Args: {
          user_id: string
        }
        Returns: void
      }
      update_user_streak: {
        Args: {
          user_id: string
        }
        Returns: void
      }
      make_user_admin: {
        Args: {
          user_email: string
        }
        Returns: void
      }
      increment_video_views: {
        Args: {
          video_id: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

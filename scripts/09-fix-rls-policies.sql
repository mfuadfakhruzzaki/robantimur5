-- Fix RLS policies for discussion groups and other tables
-- This script updates the Row Level Security policies to allow proper functionality

-- Drop existing restrictive policies for discussion_groups
DROP POLICY IF EXISTS "Discussion groups are viewable by everyone" ON public.discussion_groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.discussion_groups;

-- Create proper RLS policies for discussion_groups
CREATE POLICY "Discussion groups are viewable by everyone" 
ON public.discussion_groups FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create groups" 
ON public.discussion_groups FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Moderators can update their groups" 
ON public.discussion_groups FOR UPDATE 
USING (auth.uid() = moderator_id);

CREATE POLICY "Moderators can delete their groups" 
ON public.discussion_groups FOR DELETE 
USING (auth.uid() = moderator_id);

-- Fix group_members policies
DROP POLICY IF EXISTS "Group members are viewable by everyone" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

CREATE POLICY "Group members are viewable by everyone" 
ON public.group_members FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can join groups" 
ON public.group_members FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can leave their groups" 
ON public.group_members FOR DELETE 
USING (auth.uid() = user_id);

-- Fix user_badges policies
DROP POLICY IF EXISTS "User badges are viewable by everyone" ON public.user_badges;
DROP POLICY IF EXISTS "System can award badges" ON public.user_badges;

CREATE POLICY "User badges are viewable by everyone" 
ON public.user_badges FOR SELECT 
USING (true);

CREATE POLICY "Users can view their own badges" 
ON public.user_badges FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can award badges" 
ON public.user_badges FOR INSERT 
WITH CHECK (true);

-- Fix badges table (should be readable by everyone)
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.badges;
CREATE POLICY "Badges are viewable by everyone" 
ON public.badges FOR SELECT 
USING (true);

-- Fix daily_challenges table
DROP POLICY IF EXISTS "Challenges are viewable by everyone" ON public.daily_challenges;
CREATE POLICY "Challenges are viewable by everyone" 
ON public.daily_challenges FOR SELECT 
USING (true);

-- Ensure discussion_groups table has RLS enabled
ALTER TABLE public.discussion_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- Grant additional permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discussion_groups TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.group_members TO authenticated;
GRANT SELECT ON public.badges TO authenticated;
GRANT SELECT ON public.daily_challenges TO authenticated;
GRANT SELECT, INSERT ON public.user_badges TO authenticated;

-- Update the increment functions to work with RLS
CREATE OR REPLACE FUNCTION public.increment_group_members(group_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.discussion_groups 
  SET member_count = member_count + 1
  WHERE id = group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_event_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events 
  SET attendee_count = attendee_count + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the user stats functions work properly
CREATE OR REPLACE FUNCTION public.update_user_stats(
  user_id UUID,
  activity_type TEXT,
  points INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  -- Update user stats based on activity type
  CASE activity_type
    WHEN 'article_read' THEN
      UPDATE public.user_stats 
      SET articles_read = articles_read + 1,
          total_points = total_points + points,
          current_xp = current_xp + points,
          updated_at = NOW()
      WHERE user_stats.user_id = update_user_stats.user_id;
      
    WHEN 'ai_question' THEN
      UPDATE public.user_stats 
      SET questions_asked = questions_asked + 1,
          total_points = total_points + points,
          current_xp = current_xp + points,
          updated_at = NOW()
      WHERE user_stats.user_id = update_user_stats.user_id;
      
    WHEN 'community_post' THEN
      UPDATE public.user_stats 
      SET community_posts = community_posts + 1,
          total_points = total_points + points,
          current_xp = current_xp + points,
          updated_at = NOW()
      WHERE user_stats.user_id = update_user_stats.user_id;
      
    WHEN 'helpful_answer' THEN
      UPDATE public.user_stats 
      SET helpful_answers = helpful_answers + 1,
          total_points = total_points + points,
          current_xp = current_xp + points,
          updated_at = NOW()
      WHERE user_stats.user_id = update_user_stats.user_id;
      
    ELSE
      UPDATE public.user_stats 
      SET total_points = total_points + points,
          current_xp = current_xp + points,
          updated_at = NOW()
      WHERE user_stats.user_id = update_user_stats.user_id;
  END CASE;
  
  -- Update level based on XP
  UPDATE public.user_stats 
  SET level = CASE 
    WHEN current_xp >= 5000 THEN 10
    WHEN current_xp >= 4000 THEN 9
    WHEN current_xp >= 3000 THEN 8
    WHEN current_xp >= 2500 THEN 7
    WHEN current_xp >= 2000 THEN 6
    WHEN current_xp >= 1500 THEN 5
    WHEN current_xp >= 1000 THEN 4
    WHEN current_xp >= 600 THEN 3
    WHEN current_xp >= 300 THEN 2
    ELSE 1
  END
  WHERE user_stats.user_id = update_user_stats.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

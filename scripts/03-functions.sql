-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user stats
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

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(user_id UUID)
RETURNS VOID AS $$
DECLARE
  user_stat RECORD;
  badge RECORD;
BEGIN
  -- Get user stats
  SELECT * INTO user_stat FROM public.user_stats WHERE user_stats.user_id = check_and_award_badges.user_id;
  
  -- Check each badge condition
  FOR badge IN SELECT * FROM public.badges LOOP
    -- Skip if user already has this badge
    IF EXISTS (SELECT 1 FROM public.user_badges WHERE user_badges.user_id = check_and_award_badges.user_id AND badge_id = badge.id) THEN
      CONTINUE;
    END IF;
    
    -- Check badge conditions
    CASE badge.name
      WHEN 'Pembaca Pertama' THEN
        IF user_stat.articles_read >= 1 THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (check_and_award_badges.user_id, badge.id);
        END IF;
        
      WHEN 'Master Chatbot' THEN
        IF user_stat.questions_asked >= 10 THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (check_and_award_badges.user_id, badge.id);
        END IF;
        
      WHEN 'Penolong Komunitas' THEN
        IF user_stat.helpful_answers >= 5 THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (check_and_award_badges.user_id, badge.id);
        END IF;
        
      WHEN 'Streak Kesehatan' THEN
        IF user_stat.streak_days >= 7 THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (check_and_award_badges.user_id, badge.id);
        END IF;
        
      ELSE
        -- Default point-based badges
        IF user_stat.total_points >= badge.points_required THEN
          INSERT INTO public.user_badges (user_id, badge_id) VALUES (check_and_award_badges.user_id, badge.id);
        END IF;
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak(user_id UUID)
RETURNS VOID AS $$
DECLARE
  last_activity DATE;
  current_streak INTEGER;
BEGIN
  SELECT last_activity_date, streak_days INTO last_activity, current_streak
  FROM public.user_stats WHERE user_stats.user_id = update_user_streak.user_id;
  
  IF last_activity = CURRENT_DATE THEN
    -- Already updated today, do nothing
    RETURN;
  ELSIF last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    UPDATE public.user_stats 
    SET streak_days = streak_days + 1,
        last_activity_date = CURRENT_DATE
    WHERE user_stats.user_id = update_user_streak.user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE public.user_stats 
    SET streak_days = 1,
        last_activity_date = CURRENT_DATE
    WHERE user_stats.user_id = update_user_streak.user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment post likes
CREATE OR REPLACE FUNCTION public.increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts 
  SET likes_count = likes_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement post likes
CREATE OR REPLACE FUNCTION public.decrement_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts 
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment group members
CREATE OR REPLACE FUNCTION public.increment_group_members(group_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.discussion_groups 
  SET member_count = member_count + 1
  WHERE id = group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment event attendees
CREATE OR REPLACE FUNCTION public.increment_event_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.events 
  SET attendee_count = attendee_count + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment post count in groups
CREATE OR REPLACE FUNCTION public.increment_group_posts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.group_id IS NOT NULL THEN
    UPDATE public.discussion_groups 
    SET post_count = post_count + 1
    WHERE id = NEW.group_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update group post count when new post is created
DROP TRIGGER IF EXISTS on_post_created ON public.posts;
CREATE TRIGGER on_post_created
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.increment_group_posts();

-- Function to increment comment count
CREATE OR REPLACE FUNCTION public.increment_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts 
  SET comments_count = comments_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update post comment count when new comment is created
DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.increment_post_comments();

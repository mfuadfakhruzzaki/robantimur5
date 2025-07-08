-- Enhanced admin management and duplicate prevention
-- This script adds admin management capabilities and prevents duplicate group joins

-- Add unique constraint to prevent duplicate group memberships
ALTER TABLE public.group_members 
ADD CONSTRAINT unique_group_membership 
UNIQUE (group_id, user_id);

-- Add admin management functions
CREATE OR REPLACE FUNCTION public.admin_delete_post(post_id UUID, admin_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT (role = 'admin') INTO is_admin 
    FROM public.profiles 
    WHERE id = admin_user_id;
    
    IF NOT is_admin THEN
        RETURN FALSE;
    END IF;
    
    -- Delete the post
    DELETE FROM public.posts WHERE id = post_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_delete_group(group_id UUID, admin_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT (role = 'admin') INTO is_admin 
    FROM public.profiles 
    WHERE id = admin_user_id;
    
    IF NOT is_admin THEN
        RETURN FALSE;
    END IF;
    
    -- Delete group members first
    DELETE FROM public.group_members WHERE group_id = admin_delete_group.group_id;
    -- Delete the group
    DELETE FROM public.discussion_groups WHERE id = admin_delete_group.group_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_delete_event(event_id UUID, admin_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT (role = 'admin') INTO is_admin 
    FROM public.profiles 
    WHERE id = admin_user_id;
    
    IF NOT is_admin THEN
        RETURN FALSE;
    END IF;
    
    -- Delete event attendees first
    DELETE FROM public.event_attendees WHERE event_id = admin_delete_event.event_id;
    -- Delete the event
    DELETE FROM public.events WHERE id = admin_delete_event.event_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is already in group
CREATE OR REPLACE FUNCTION public.is_user_in_group(user_id UUID, group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.group_members 
        WHERE group_members.user_id = is_user_in_group.user_id 
        AND group_members.group_id = is_user_in_group.group_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is registered for event
CREATE OR REPLACE FUNCTION public.is_user_registered_for_event(user_id UUID, event_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.event_attendees 
        WHERE event_attendees.user_id = is_user_registered_for_event.user_id 
        AND event_attendees.event_id = is_user_registered_for_event.event_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS policies for admin management
CREATE POLICY "Admins can manage all posts" 
ON public.posts FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can manage all groups" 
ON public.discussion_groups FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can manage all events" 
ON public.events FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Grant admin permissions
GRANT EXECUTE ON FUNCTION public.admin_delete_post TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_group TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_in_group TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_registered_for_event TO authenticated;

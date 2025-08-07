
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'message', 'follow')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  related_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  related_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT,
  sender_user_id UUID DEFAULT NULL,
  post_id UUID DEFAULT NULL,
  comment_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Don't create notification for self-actions
  IF target_user_id = sender_user_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_user_id,
    related_post_id,
    related_comment_id
  ) VALUES (
    target_user_id,
    notification_type,
    notification_title,
    notification_message,
    sender_user_id,
    post_id,
    comment_id
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;

-- Create trigger for like notifications
CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_author_id UUID;
  liker_name TEXT;
BEGIN
  -- Get post author and liker name
  SELECT p.user_id INTO post_author_id 
  FROM public.posts p 
  WHERE p.id = NEW.post_id;
  
  SELECT pr.full_name INTO liker_name 
  FROM public.profiles pr 
  WHERE pr.user_id = NEW.user_id;

  -- Create notification
  PERFORM create_notification(
    post_author_id,
    'like',
    'New like on your post',
    liker_name || ' liked your post',
    NEW.user_id,
    NEW.post_id
  );

  RETURN NEW;
END;
$$;

-- Create trigger for comment notifications
CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_author_id UUID;
  commenter_name TEXT;
BEGIN
  -- Get post author and commenter name
  SELECT p.user_id INTO post_author_id 
  FROM public.posts p 
  WHERE p.id = NEW.post_id;
  
  SELECT pr.full_name INTO commenter_name 
  FROM public.profiles pr 
  WHERE pr.user_id = NEW.user_id;

  -- Create notification
  PERFORM create_notification(
    post_author_id,
    'comment',
    'New comment on your post',
    commenter_name || ' commented on your post',
    NEW.user_id,
    NEW.post_id,
    NEW.id
  );

  RETURN NEW;
END;
$$;

-- Create trigger for message notifications
CREATE OR REPLACE FUNCTION notify_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  participant_record RECORD;
  sender_name TEXT;
BEGIN
  -- Get sender name
  SELECT pr.full_name INTO sender_name 
  FROM public.profiles pr 
  WHERE pr.user_id = NEW.sender_id;

  -- Notify all participants except sender
  FOR participant_record IN 
    SELECT cp.user_id 
    FROM public.conversation_participants cp 
    WHERE cp.conversation_id = NEW.conversation_id 
    AND cp.user_id != NEW.sender_id
  LOOP
    PERFORM create_notification(
      participant_record.user_id,
      'message',
      'New message',
      sender_name || ' sent you a message',
      NEW.sender_id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_like ON public.likes;
CREATE TRIGGER trigger_notify_like 
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION notify_post_like();

DROP TRIGGER IF EXISTS trigger_notify_comment ON public.comments;
CREATE TRIGGER trigger_notify_comment 
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION notify_post_comment();

DROP TRIGGER IF EXISTS trigger_notify_message ON public.messages;
CREATE TRIGGER trigger_notify_message 
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION notify_message();

-- Fix the get_or_create_conversation function to ensure participants are properly added
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(user1_id uuid, user2_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    conversation_uuid UUID;
    participant_count INT;
BEGIN
    -- Try to find existing conversation between the two users
    SELECT c.id INTO conversation_uuid
    FROM public.conversations c
    WHERE c.id IN (
        SELECT cp1.conversation_id
        FROM public.conversation_participants cp1
        JOIN public.conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
        WHERE cp1.user_id = user1_id AND cp2.user_id = user2_id
        GROUP BY cp1.conversation_id
        HAVING COUNT(DISTINCT cp1.user_id) = 1 AND COUNT(DISTINCT cp2.user_id) = 1
    )
    LIMIT 1;

    -- If no conversation exists, create one
    IF conversation_uuid IS NULL THEN
        INSERT INTO public.conversations DEFAULT VALUES RETURNING id INTO conversation_uuid;
        
        -- Add both users as participants
        INSERT INTO public.conversation_participants (conversation_id, user_id)
        VALUES (conversation_uuid, user1_id), (conversation_uuid, user2_id);
    ELSE
        -- Ensure both users are participants (in case of data inconsistency)
        INSERT INTO public.conversation_participants (conversation_id, user_id)
        VALUES (conversation_uuid, user1_id)
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
        
        INSERT INTO public.conversation_participants (conversation_id, user_id)
        VALUES (conversation_uuid, user2_id)
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END IF;

    RETURN conversation_uuid;
END;
$$;

-- Add unique constraint to prevent duplicate participants
ALTER TABLE public.conversation_participants 
ADD CONSTRAINT unique_conversation_participant 
UNIQUE (conversation_id, user_id);


-- First, let's check if we have proper foreign key relationships and triggers for comments
-- Add foreign key constraints to ensure data integrity
ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.comments 
ADD CONSTRAINT comments_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

-- Create trigger to automatically update post comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET comments_count = GREATEST(0, comments_count - 1) 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comments count updates
DROP TRIGGER IF EXISTS trigger_update_comments_count ON public.comments;
CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Enable real-time for messages and conversations
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_participants REPLICA IDENTITY FULL;

-- Add messages and conversations to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;

-- Create a table to track online users
CREATE TABLE IF NOT EXISTS public.user_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for user_presence
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Create policies for user_presence
CREATE POLICY "Users can view all presence data" ON public.user_presence FOR SELECT USING (true);
CREATE POLICY "Users can update their own presence" ON public.user_presence FOR ALL USING (auth.uid() = user_id);

-- Create a table to track unread messages
CREATE TABLE IF NOT EXISTS public.unread_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, message_id)
);

-- Enable RLS for unread_messages
ALTER TABLE public.unread_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for unread_messages
CREATE POLICY "Users can view their own unread messages" ON public.unread_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own unread messages" ON public.unread_messages FOR ALL USING (auth.uid() = user_id);

-- Function to mark messages as unread for other participants
CREATE OR REPLACE FUNCTION create_unread_messages()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert unread message record for all conversation participants except sender
  INSERT INTO public.unread_messages (user_id, conversation_id, message_id)
  SELECT cp.user_id, NEW.conversation_id, NEW.id
  FROM public.conversation_participants cp
  WHERE cp.conversation_id = NEW.conversation_id 
  AND cp.user_id != NEW.sender_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for unread messages
DROP TRIGGER IF EXISTS trigger_create_unread_messages ON public.messages;
CREATE TRIGGER trigger_create_unread_messages
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION create_unread_messages();

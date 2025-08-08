
-- Create a table to store user interactions/recent chats
CREATE TABLE IF NOT EXISTS public.recent_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  other_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  last_interacted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, other_user_id)
);

-- Enable RLS on recent_chats table
ALTER TABLE public.recent_chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recent_chats
CREATE POLICY "Users can view their own recent chats" 
  ON public.recent_chats 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recent chats" 
  ON public.recent_chats 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recent chats" 
  ON public.recent_chats 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recent chats" 
  ON public.recent_chats 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to get recent chats with user details
CREATE OR REPLACE FUNCTION public.get_recent_chats(target_user_id uuid)
RETURNS TABLE(
  other_user_id uuid, 
  other_user_name text, 
  other_user_avatar text, 
  other_user_university text,
  last_interacted_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id as other_user_id,
        p.full_name as other_user_name,
        p.avatar_url as other_user_avatar,
        p.university as other_user_university,
        rc.last_interacted_at
    FROM public.recent_chats rc
    JOIN public.profiles p ON rc.other_user_id = p.user_id
    WHERE rc.user_id = target_user_id
    ORDER BY rc.last_interacted_at DESC;
END;
$$;

-- Create function to upsert recent chat
CREATE OR REPLACE FUNCTION public.upsert_recent_chat(current_user_id uuid, target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.recent_chats (user_id, other_user_id, last_interacted_at)
    VALUES (current_user_id, target_user_id, now())
    ON CONFLICT (user_id, other_user_id) 
    DO UPDATE SET last_interacted_at = now();
END;
$$;

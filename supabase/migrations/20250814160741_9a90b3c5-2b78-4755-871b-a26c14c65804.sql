
-- Create table for deleted chats
CREATE TABLE public.deleted_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT NOT NULL DEFAULT 'deleted' -- 'deleted', 'cleared', etc.
);

-- Create table for blocked users
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Add Row Level Security
ALTER TABLE public.deleted_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for deleted_chats
CREATE POLICY "Users can view their own deleted chats" 
  ON public.deleted_chats 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deleted chats" 
  ON public.deleted_chats 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for blocked_users
CREATE POLICY "Users can view their own blocks" 
  ON public.blocked_users 
  FOR SELECT 
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create their own blocks" 
  ON public.blocked_users 
  FOR INSERT 
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks" 
  ON public.blocked_users 
  FOR DELETE 
  USING (auth.uid() = blocker_id);

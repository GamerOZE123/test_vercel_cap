
-- Add image support to posts table (if not already exists)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create a function to create or get conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
    conversation_uuid UUID;
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
        HAVING COUNT(*) = 2
    )
    AND (
        SELECT COUNT(*)
        FROM public.conversation_participants cp
        WHERE cp.conversation_id = c.id
    ) = 2
    LIMIT 1;

    -- If no conversation exists, create one
    IF conversation_uuid IS NULL THEN
        INSERT INTO public.conversations DEFAULT VALUES RETURNING id INTO conversation_uuid;
        
        -- Add both users as participants
        INSERT INTO public.conversation_participants (conversation_id, user_id)
        VALUES (conversation_uuid, user1_id), (conversation_uuid, user2_id);
    END IF;

    RETURN conversation_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user conversations with latest message info
CREATE OR REPLACE FUNCTION public.get_user_conversations(target_user_id UUID)
RETURNS TABLE (
    conversation_id UUID,
    other_user_id UUID,
    other_user_name TEXT,
    other_user_avatar TEXT,
    other_user_university TEXT,
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as conversation_id,
        p.user_id as other_user_id,
        p.full_name as other_user_name,
        p.avatar_url as other_user_avatar,
        p.university as other_user_university,
        m.content as last_message,
        m.created_at as last_message_time,
        0::BIGINT as unread_count
    FROM public.conversations c
    JOIN public.conversation_participants cp ON c.id = cp.conversation_id
    JOIN public.conversation_participants cp_other ON c.id = cp_other.conversation_id AND cp_other.user_id != target_user_id
    JOIN public.profiles p ON cp_other.user_id = p.user_id
    LEFT JOIN LATERAL (
        SELECT content, created_at
        FROM public.messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
    ) m ON true
    WHERE cp.user_id = target_user_id
    ORDER BY m.created_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for conversations and participants
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can manage conversation participants" ON public.conversation_participants;

CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can manage conversation participants" ON public.conversation_participants FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR conversation_id IN (
    SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
  ));

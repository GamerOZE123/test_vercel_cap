
-- Fix the foreign key relationships for posts table
ALTER TABLE public.posts 
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

-- Fix the foreign key relationships for messages table  
ALTER TABLE public.messages
ADD CONSTRAINT messages_conversation_id_fkey
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);

ALTER TABLE public.messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(user_id);

-- Fix the foreign key relationships for conversation_participants table
ALTER TABLE public.conversation_participants
ADD CONSTRAINT conversation_participants_conversation_id_fkey
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);

ALTER TABLE public.conversation_participants
ADD CONSTRAINT conversation_participants_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

-- Fix the foreign key relationships for other tables
ALTER TABLE public.comments
ADD CONSTRAINT comments_post_id_fkey
FOREIGN KEY (post_id) REFERENCES public.posts(id);

ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.likes
ADD CONSTRAINT likes_post_id_fkey
FOREIGN KEY (post_id) REFERENCES public.posts(id);

ALTER TABLE public.likes
ADD CONSTRAINT likes_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.follows
ADD CONSTRAINT follows_follower_id_fkey
FOREIGN KEY (follower_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.follows
ADD CONSTRAINT follows_following_id_fkey
FOREIGN KEY (following_id) REFERENCES public.profiles(user_id);

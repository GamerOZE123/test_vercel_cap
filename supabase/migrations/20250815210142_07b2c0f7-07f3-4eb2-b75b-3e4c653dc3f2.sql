
-- Fix the foreign key relationship for comments table
ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also ensure we have the proper foreign key for posts
ALTER TABLE public.comments 
ADD CONSTRAINT comments_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

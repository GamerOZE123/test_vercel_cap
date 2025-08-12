
-- Add foreign key constraint between posts and profiles
ALTER TABLE posts 
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

-- Add foreign key constraint between comments and profiles  
ALTER TABLE comments
ADD CONSTRAINT comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

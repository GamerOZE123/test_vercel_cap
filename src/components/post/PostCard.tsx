
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    likes_count: number;
    comments_count: number;
    profiles: {
      full_name: string;
      username: string;
      avatar_url?: string;
      university?: string;
    };
  };
  onUpdate?: () => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const { user } = useAuth();
  const { isLiked, likesCount, toggleLike } = useLikes(post.id);
  const { comments, commentsCount, addComment, deleteComment, submitting } = useComments(post.id);
  
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isEditing, setIsEditing] = useState(false);

  const isOwnPost = user?.id === post.user_id;
  const userName = post.profiles?.full_name || post.profiles?.username || 'Unknown User';
  const userUniversity = post.profiles?.university || '';

  const handleAddComment = async () => {
    if (!newComment.trim() || submitting) return;
    
    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleEditPost = async () => {
    if (!editContent.trim() || isEditing) return;

    setIsEditing(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ 
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setShowEditModal(false);
      toast.success('Post updated successfully!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('Post deleted successfully!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {userName.charAt(0)}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold">{userName}</p>
                {userUniversity && (
                  <p className="text-sm text-muted-foreground">{userUniversity}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()} at{' '}
                  {new Date(post.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {post.updated_at !== post.created_at && ' (edited)'}
                </p>
              </div>
              
              {isOwnPost && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeletePost}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
            
            {post.image_url && (
              <div className="mb-4">
                <img
                  src={post.image_url}
                  alt="Post image"
                  className="rounded-lg max-w-full h-auto"
                />
              </div>
            )}
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleLike()}
                className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {likesCount}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                {commentsCount}
              </Button>
              
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Share className="w-4 h-4" />
                Share
              </Button>
            </div>
            
            {showComments && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    disabled={submitting}
                  />
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submitting}
                    size="sm"
                  >
                    {submitting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {comment.profiles?.full_name?.charAt(0) || 
                           comment.profiles?.username?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 bg-muted rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">
                            {comment.profiles?.full_name || comment.profiles?.username || 'Unknown User'}
                          </p>
                          {comment.user_id === user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteComment(comment.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Edit Post Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowEditModal(false)} 
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditPost}
                disabled={!editContent.trim() || isEditing}
                className="flex-1"
              >
                {isEditing ? 'Updating...' : 'Update Post'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

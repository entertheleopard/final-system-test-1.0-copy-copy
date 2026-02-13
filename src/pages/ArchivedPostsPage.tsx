import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import PostDetailModal from '@/components/PostDetailModal';
import { Archive, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@animaapp/playground-react-sdk';
import { useMockQuery } from '@/hooks/useMockQuery';
import { useMockMutation } from '@/hooks/useMockMutation';
import { isMockMode } from '@/utils/mockMode';
import { useToast } from '@/hooks/use-toast';
import { handleImageError, resolveMedia } from '@/lib/utils';
import type { Post } from '@/types/social';

export default function ArchivedPostsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [archivedPosts, setArchivedPosts] = useState<Post[]>([]);

  const { user } = useAuth();

  // Fetch Posts
  const realQuery = isMockMode() ? null : useQuery('Post', { orderBy: { createdAt: 'desc' } });
  const mockQuery = isMockMode() ? useMockQuery('Post', {}) : null;
  const { data: fetchedPosts, isPending } = (isMockMode() ? mockQuery : realQuery)!;

  // Mutations
  const realMutation = isMockMode() ? null : useMutation('Post');
  const mockMutation = isMockMode() ? useMockMutation('Post') : null;
  const { update, remove } = (isMockMode() ? mockMutation : realMutation)!;

  useEffect(() => {
    if (fetchedPosts && user) {
      // Filter for archived posts by current user
      const mappedPosts = fetchedPosts
        .filter((p: any) => p.isArchived && p.authorId === user.id)
        .map((p: any) => ({
          ...p,
          isLiked: false,
          isSaved: false,
        }));
      setArchivedPosts(mappedPosts);
    }
  }, [fetchedPosts, user]);

  const handleUnarchive = async (postId: string) => {
    try {
      await update(postId, { isArchived: false });
      setArchivedPosts(prev => prev.filter(p => p.id !== postId));
      setSelectedPost(null);
      toast({
        title: 'Post unarchived',
        description: 'Post restored to your profile.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unarchive post.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await remove(postId);
      setArchivedPosts(prev => prev.filter(p => p.id !== postId));
      setSelectedPost(null);
      toast({
        title: 'Post deleted',
        description: 'Post permanently deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post.',
        variant: 'destructive',
      });
    }
  };

  return (
    <InstagramLayout>
      <div className="w-full max-w-4xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/settings')}
            className="text-foreground hover:text-tertiary-foreground transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-h1 font-bold text-foreground">Archived Posts</h1>
        </div>

        {archivedPosts.length === 0 ? (
          <div className="bg-background border border-border rounded-lg p-12 text-center">
            <Archive className="w-16 h-16 mx-auto mb-4 text-tertiary-foreground" strokeWidth={1.5} />
            <h3 className="text-h3 font-semibold text-foreground mb-2">No Archived Posts</h3>
            <p className="text-body text-tertiary-foreground">
              Posts you archive will appear here. Only you can see them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {archivedPosts.map(post => {
              const media = resolveMedia(post);
              return (
                <div
                  key={post.id}
                  className="aspect-square bg-tertiary cursor-pointer relative group overflow-hidden"
                  onClick={() => setSelectedPost(post)}
                >
                  {media?.type === 'video' ? (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={media?.url}
                      alt={post.content}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-h4 font-semibold">{post.likes.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          allPosts={archivedPosts}
          onClose={() => setSelectedPost(null)}
          onLike={() => {}}
          onRepost={() => {}}
          onSave={() => {}}
        />
      )}
    </InstagramLayout>
  );
}

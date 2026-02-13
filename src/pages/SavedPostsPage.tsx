import { useState } from 'react';
import InstagramLayout from '@/components/InstagramLayout';
import PostDetailModal from '@/components/PostDetailModal';
import { Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleImageError, resolveMedia, getRandomMockImage } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Post } from '@/types/social';

export default function SavedPostsPage() {
  const { toast } = useToast();
  const { createNotification } = useNotifications();
  const { user } = useAuth();

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

  const handleLike = (postId: string) => {
    setSavedPosts(currentPosts => currentPosts.map(post => {
      if (post.id === postId) {
        const isLiking = !post.isLiked;
        if (isLiking && user) {
          createNotification({
            type: 'like',
            fromUserId: user.id,
            toUserId: post.authorId,
            postId: post.id,
            previewText: 'liked your post'
          });
        }
        return { ...post, isLiked: isLiking, likes: isLiking ? post.likes + 1 : post.likes - 1 };
      }
      return post;
    }));
  };

  const handleRepost = (postId: string) => {
    setSavedPosts(savedPosts.map(post =>
      post.id === postId
        ? { ...post, reposts: post.reposts + 1 }
        : post
    ));
    toast({
      title: 'Reposted',
      description: 'Post shared to your profile',
    });
  };

  const handleSave = (postId: string) => {
    setSavedPosts(savedPosts.filter(post => post.id !== postId));
    toast({
      title: 'Removed from Saved',
      description: 'Post removed from your saved collection',
    });
  };

  return (
    <InstagramLayout>
      <div className="w-full max-w-4xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        <h1 className="text-h1 font-bold text-foreground mb-8">Saved Posts</h1>

        {savedPosts.length === 0 ? (
          <div className="bg-background border border-border rounded-lg p-12 text-center">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-tertiary-foreground" strokeWidth={1.5} />
            <h3 className="text-h3 font-semibold text-foreground mb-2">No Saved Posts</h3>
            <p className="text-body text-tertiary-foreground">
              Posts you save will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {savedPosts.map(post => {
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
                    <div className="flex items-center gap-2">
                      <span className="text-h4 font-semibold">{post.comments}</span>
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
          allPosts={savedPosts}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onRepost={handleRepost}
          onSave={handleSave}
        />
      )}
    </InstagramLayout>
  );
}

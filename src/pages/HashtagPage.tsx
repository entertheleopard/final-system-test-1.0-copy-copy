import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import PostDetailModal from '@/components/PostDetailModal';
import { ArrowLeft, Hash } from 'lucide-react';
import { handleImageError, getRandomMockImage } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Post } from '@/types/social';

export default function HashtagPage() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const { createNotification } = useNotifications();
  const { user } = useAuth();

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [hashtagPosts, setHashtagPosts] = useState<Post[]>([]);

  const handleLike = (postId: string) => {
    setHashtagPosts(currentPosts => currentPosts.map(post => {
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

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-border">
          <button 
            onClick={() => navigate(-1)}
            className="text-foreground hover:text-tertiary-foreground transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-h3 font-bold text-foreground flex items-center gap-1">
              <Hash className="w-5 h-5" />
              {tag}
            </h1>
            <p className="text-caption text-tertiary-foreground">1.2M posts</p>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-1">
          <div className="grid grid-cols-3 gap-1">
            {hashtagPosts.map(post => (
              <div 
                key={post.id} 
                onClick={() => setSelectedPost(post)}
                className="aspect-square relative group cursor-pointer bg-tertiary"
              >
                <img 
                  src={post.mediaUrl} 
                  alt={post.content} 
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          allPosts={hashtagPosts}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onRepost={() => {}}
          onSave={() => {}}
        />
      )}
    </InstagramLayout>
  );
}

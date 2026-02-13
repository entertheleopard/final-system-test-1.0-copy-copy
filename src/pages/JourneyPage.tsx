import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import PostDetailModal from '@/components/PostDetailModal';
import JourneyGridItem from '@/components/JourneyGridItem';
import { useToast } from '@/hooks/use-toast';
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Post } from '@/types/social';
import { supabase } from '../../supabase';
import { Button } from '@/components/ui/button';

export default function JourneyPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createNotification } = useNotifications();
  const { user } = useAuth();
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [explorePosts, setExplorePosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate 24 hours ago
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .gte('created_at', twentyFourHoursAgo)
        .gte('likes', 3)
        .order('likes', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedPosts: Post[] = data.map((p: any) => ({
          id: p.id,
          authorId: p.user_id,
          authorName: p.profiles?.username || 'Unknown',
          authorAvatar: p.profiles?.avatar_url || '',
          content: p.content,
          mediaUrl: p.media_url,
          mediaType: p.media_type || 'image',
          likes: p.likes || 0,
          comments: p.comments || 0,
          reposts: p.reposts || 0,
          saves: p.saves || 0,
          isLiked: false, // TODO: Implement user-specific like check
          isSaved: false,
          isArchived: false,
          createdAt: new Date(p.created_at),
        }));
        setExplorePosts(mappedPosts);
      }
    } catch (err: any) {
      console.error('Error fetching trending posts:', err);
      setError(err.message || 'Failed to load trending posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const handleLike = (postId: string) => {
    setExplorePosts(currentPosts => currentPosts.map(post => {
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
    setExplorePosts(explorePosts.map(post =>
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
    setExplorePosts(explorePosts.map(post =>
      post.id === postId
        ? { ...post, isSaved: !post.isSaved, saves: post.isSaved ? post.saves - 1 : post.saves + 1 }
        : post
    ));
  };

  return (
    <InstagramLayout>
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-h1 font-bold text-foreground">Journey</h1>
          <button 
            onClick={() => navigate('/search')}
            className="p-2 bg-tertiary rounded-full hover:bg-secondary transition-colors"
          >
            <Search className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-error/10 p-4 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-body font-semibold text-foreground mb-2">Unable to load trending posts</h3>
            <p className="text-body-sm text-tertiary-foreground mb-6">
              {error}
            </p>
            <Button onClick={fetchTrendingPosts} variant="outline" className="border-border hover:bg-tertiary">
              Try Again
            </Button>
          </div>
        ) : explorePosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-body text-tertiary-foreground">No trending posts found in the last 24 hours.</p>
          </div>
        ) : (
          /* Masonry Layout */
          <div className="columns-2 md:columns-3 gap-1 sm:gap-2 space-y-1 sm:space-y-2">
            {explorePosts.map(post => (
              <JourneyGridItem 
                key={post.id} 
                post={post} 
                onClick={setSelectedPost} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          allPosts={explorePosts}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onRepost={handleRepost}
          onSave={handleSave}
        />
      )}
    </InstagramLayout>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import PostCard from '@/components/PostCard';
import PostSkeleton from '@/components/PostSkeleton';
import StoryCircle from '@/components/StoryCircle';
import CommentsSheet from '@/components/CommentsSheet';
import { useStories } from '@/contexts/StoriesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@animaapp/playground-react-sdk';
import { useMockMutation } from '@/hooks/useMockMutation';
import { useNotifications } from '@/contexts/NotificationsContext';
import { isMockMode } from '@/utils/mockMode';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle, Layers, MessageCircle } from 'lucide-react';
import type { Post } from '@/types/social';
import { supabase } from '../../supabase';

export default function LadderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stories, hasActiveStory, getStoriesForUser } = useStories();
  const { createNotification } = useNotifications();
  const { user } = useAuth();

  // Local state for posts
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Mutations (keep for delete/archive actions if they use SDK, or replace later)
  const realMutation = isMockMode() ? null : useMutation('Post');
  const mockMutation = isMockMode() ? useMockMutation('Post') : null;
  const { update, remove } = (isMockMode() ? mockMutation : realMutation)!;

  const [commentPost, setCommentPost] = useState<Post | null>(null);

  // Fetch Posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch posts with profile data
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles (
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });

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
          setLocalPosts(mappedPosts);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  // Filter stories to show only those with active items
  // Sorted chronologically by latest story update (newest first)
  const activeStoryUserIds = Object.keys(stories)
    .filter(id => id !== user?.id && hasActiveStory(id))
    .sort((a, b) => {
      const storyA = stories[a];
      const storyB = stories[b];
      
      const getLastUpdate = (s: typeof storyA) => {
        if (!s?.items || s.items.length === 0) return 0;
        return Math.max(...s.items.map(i => new Date(i.createdAt).getTime()));
      };

      return getLastUpdate(storyB) - getLastUpdate(storyA);
    });

  // Always show current user story circle (with + button) if logged in
  const showCurrentUserStory = !!user;
  
  // Determine if the stories row should be shown at all
  const showStoriesRow = showCurrentUserStory || activeStoryUserIds.length > 0;

  const handleLike = useCallback((postId: string) => {
    setLocalPosts(currentPosts => {
      const post = currentPosts.find(p => p.id === postId);
      
      // Trigger notification if liking (not unliking)
      if (post && !post.isLiked && user) {
        createNotification({
          type: 'like',
          fromUserId: user.id,
          toUserId: post.authorId,
          postId: post.id,
          previewText: 'liked your post'
        });
      }

      return currentPosts.map(post =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      );
    });
  }, [user, createNotification]);

  const handleComment = useCallback((postId: string) => {
    setLocalPosts(currentPosts => {
      const post = currentPosts.find(p => p.id === postId);
      if (post) {
        setCommentPost(post);
      }
      return currentPosts;
    });
  }, []);

  const handleRepost = useCallback((postId: string) => {
    setLocalPosts(currentPosts => currentPosts.map(post =>
      post.id === postId
        ? { ...post, reposts: post.reposts + 1 }
        : post
    ));
    toast({
      title: 'Reposted',
      description: 'Post shared to your profile',
    });
  }, [toast]);

  const handleSave = useCallback((postId: string) => {
    setLocalPosts(currentPosts => currentPosts.map(post =>
      post.id === postId
        ? { ...post, isSaved: !post.isSaved, saves: post.isSaved ? post.saves - 1 : post.saves + 1 }
        : post
    ));
  }, []);

  const handleMediaClick = useCallback((post: Post) => {
    if (post.id.startsWith('live-')) {
      navigate(`/live/watch/${post.id}`);
    }
  }, [navigate]);

  const handleDelete = async (postId: string) => {
    console.log("handleDelete called for:", postId);
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      console.log("Post deleted successfully:", postId);
      setLocalPosts(prev => prev.filter(p => p.id !== postId));
      toast({
        title: "Post deleted",
        description: "The post has been permanently deleted."
      });
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive"
      });
    }
  };

  const handleArchive = async (postId: string) => {
    console.log("handleArchive called for:", postId);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ archived: true })
        .eq("id", postId);

      if (error) throw error;

      console.log("Post archived successfully:", postId);
      setLocalPosts(prev => prev.filter(p => p.id !== postId));
      toast({
        title: "Post archived",
        description: "The post has been moved to your archive."
      });
    } catch (error) {
      console.error("Archive failed:", error);
      toast({
        title: "Error",
        description: "Failed to archive post.",
        variant: "destructive"
      });
    }
  };

  const handleAddStory = () => {
    if (user && hasActiveStory(user.id)) {
      // If user has a story, open it (StoryCircle handles this via context now if we pass the right props, 
      // but for the "Add Story" button specifically, we might want to open the viewer OR go to create)
      // The prompt implies standard behavior: tap your story to view, or add.
      // Let's assume tapping the "Your Story" circle when you have a story opens it.
      // But usually there's a small "+" badge to add.
      // For now, let's just navigate to create if they click the main button, 
      // or we can rely on StoryCircle's internal logic if we updated it.
      // However, StoryCircle's `onClick` prop overrides internal logic.
      // Let's just navigate to create for simplicity as per "Add Story" intent.
      navigate('/stories/create');
    } else {
      navigate('/stories/create');
    }
  };

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-6">
          <h1 className="font-brand text-3xl text-primary lg:hidden">Invoque</h1>
          <button 
            onClick={() => navigate('/messages')}
            className="text-foreground hover:text-primary transition-colors p-2 -mr-2 ml-auto"
            aria-label="Messages"
          >
            <MessageCircle className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        {/* Stories */}
        {showStoriesRow && (
          <div className="px-4 mb-6">
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {showCurrentUserStory && (
                  <StoryCircle isAddStory onClick={handleAddStory} />
                )}
                {activeStoryUserIds.map(userId => (
                  <StoryCircle
                    key={userId}
                    userId={userId}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feed */}
        <div>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <PostSkeleton key={i} isEdgeToEdge={true} />
            ))
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-error/10 p-4 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-body font-semibold text-foreground mb-2">Unable to load feed</h3>
              <p className="text-body-sm text-tertiary-foreground mb-6">
                Something went wrong while loading posts.
              </p>
              <Button onClick={handleRetry} variant="outline" className="border-border hover:bg-tertiary">
                Try Again
              </Button>
            </div>
          ) : localPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-tertiary p-4 rounded-full mb-4">
                <Layers className="w-8 h-8 text-tertiary-foreground" />
              </div>
              <h3 className="text-body font-semibold text-foreground mb-2">Your feed is empty</h3>
              <p className="text-body-sm text-tertiary-foreground mb-6 max-w-xs mx-auto">
                Add more creators or check out the Journey page to discover new content.
              </p>
              <Button onClick={() => navigate('/journey')} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                Explore Journey
              </Button>
            </div>
          ) : (
            localPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onRepost={handleRepost}
                onSave={handleSave}
                onMediaClick={handleMediaClick}
                onDelete={handleDelete}
                onArchive={handleArchive}
                isEdgeToEdge={true}
              />
            ))
          )}
        </div>
      </div>

      {/* Comments Sheet */}
      {commentPost && (
        <CommentsSheet
          post={commentPost}
          onClose={() => setCommentPost(null)}
        />
      )}
    </InstagramLayout>
  );
}

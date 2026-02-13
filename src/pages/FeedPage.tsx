import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import PostCard from '@/components/PostCard';
import StoryCircle from '@/components/StoryCircle';
import FullscreenMediaModal from '@/components/FullscreenMediaModal';
import CommentsSheet from '@/components/CommentsSheet';
import { useToast } from '@/hooks/use-toast';
import { getRandomMockImage } from '@/lib/utils';
import type { Post, Story } from '@/types/social';
import { supabase } from '../../supabase';

export default function FeedPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentPost, setCommentPost] = useState<Post | null>(null);

  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(username, avatar_url)")
        .eq("archived", false)
        .order("created_at", { ascending: false });

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
          isLiked: false,
          isSaved: false,
          createdAt: new Date(p.created_at),
        }));
        setPosts(mappedPosts);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setCommentPost(post);
    }
  };

  const handleMediaClick = (post: Post) => {
    if (post.id.startsWith('live-')) {
      navigate(`/live/watch/${post.id}`);
    } else {
      setSelectedPost(post);
    }
  };

  const handleRepost = (postId: string) => {
    setPosts(posts.map(post =>
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
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isSaved: !post.isSaved, saves: post.isSaved ? post.saves - 1 : post.saves + 1 }
        : post
    ));
  };

  const handleDelete = async (postId: string) => {
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

      setPosts(prev => prev.filter(p => p.id !== postId));
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
    try {
      const { error } = await supabase
        .from("posts")
        .update({ archived: true })
        .eq("id", postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));
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
    navigate('/stories/create');
  };

  return (
    <InstagramLayout>
      <div className="w-full max-w-2xl mx-auto py-4 px-4 sm:py-6 lg:py-8">
        {/* Stories */}
        {stories.length > 0 && (
          <div className="bg-white border border-border rounded-lg p-4 mb-6">
            <div className="flex gap-4 overflow-x-auto pb-2">
              <StoryCircle isAddStory onClick={handleAddStory} />
              {stories.map(story => (
                <StoryCircle
                  key={story.id}
                  userId={story.userId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Feed */}
        <div>
          {posts.map(post => (
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
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Media Modal */}
      {selectedPost && (
        <FullscreenMediaModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

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

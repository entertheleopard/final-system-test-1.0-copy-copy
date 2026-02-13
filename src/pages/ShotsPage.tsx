import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useShareActions } from '@/contexts/ShareContext';
import InstagramLayout from '@/components/InstagramLayout';
import CommentsSheet from '@/components/CommentsSheet';
import ShotItem from '@/components/ShotItem';
import type { Post } from '@/types/social';
import { supabase } from '../../supabase';
import { Loader2 } from 'lucide-react';

export default function ShotsPage() {
  const { user } = useAuth();
  const { openShare } = useShareActions();
  
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [activePostId, setActivePostId] = useState<string>('');
  const [shotsData, setShotsData] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchShots = async () => {
      setIsLoading(true);
      try {
        // Fetch posts that are videos or just random posts for discovery
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles (
              username,
              avatar_url
            )
          `)
          .eq('archived', false)
          .order('created_at', { ascending: false })
          .limit(20);

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
            isLiked: false,
            isSaved: false,
            createdAt: new Date(p.created_at),
          }));
          
          // Shuffle for discovery feel
          const shuffled = mappedPosts.sort(() => 0.5 - Math.random());
          setShotsData(shuffled);
          
          if (shuffled.length > 0) {
            setActivePostId(shuffled[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching shots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShots();
  }, []);

  // Handle scroll snap
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.getAttribute('data-post-id');
            if (postId) {
              setActivePostId(postId);
            }
          }
        });
      },
      {
        threshold: 0.6, // Trigger when 60% visible
      }
    );

    const elements = container.querySelectorAll('[data-post-id]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [shotsData]);

  const handleLike = (shotId: string) => {
    setShotsData(shotsData.map(shot =>
      shot.id === shotId
        ? { ...shot, isLiked: !shot.isLiked, likes: shot.isLiked ? shot.likes - 1 : shot.likes + 1 }
        : shot
    ));
  };

  const handleSave = (shotId: string) => {
    setShotsData(shotsData.map(shot =>
      shot.id === shotId
        ? { ...shot, isSaved: !shot.isSaved, saves: shot.isSaved ? shot.saves - 1 : shot.saves + 1 }
        : shot
    ));
  };

  const activePost = shotsData.find(p => p.id === activePostId) || shotsData[0];

  return (
    <InstagramLayout>
      {/* Scroll Container */}
      <div 
        ref={containerRef}
        className="h-[calc(100vh-4rem)] lg:h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar"
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : shotsData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white p-8 text-center">
            <h3 className="text-xl font-bold mb-2">No shots available</h3>
            <p className="text-white/60">Check back later for new content.</p>
          </div>
        ) : (
          shotsData.map((shot) => (
            <ShotItem
              key={shot.id}
              shot={shot}
              isActive={activePostId === shot.id}
              isMuted={isMuted}
              onMuteToggle={() => setIsMuted(!isMuted)}
              onLike={handleLike}
              onComment={(id) => {
                setActivePostId(id);
                setShowComments(true);
              }}
              onShare={(post) => {
                setActivePostId(post.id);
                openShare(post);
              }}
              onSave={handleSave}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>

      {/* Comments Sheet */}
      {showComments && activePost && (
        <CommentsSheet post={activePost} onClose={() => setShowComments(false)} />
      )}
    </InstagramLayout>
  );
}

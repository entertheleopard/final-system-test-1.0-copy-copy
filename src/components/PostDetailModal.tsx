import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import CommentsSheet from './CommentsSheet';
import InsightsModal from '@/components/insights/InsightsModal';
import PostDetailItem from './PostDetailItem';
import type { Post } from '@/types/social';

interface PostDetailModalProps {
  post: Post;
  allPosts: Post[];
  onClose: () => void;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onSave: (postId: string) => void;
  showInsights?: boolean;
}

export default function PostDetailModal({ 
  post: initialPost, 
  allPosts, 
  onClose, 
  onLike, 
  onRepost, 
  onSave,
  showInsights = false
}: PostDetailModalProps) {
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to initial post on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const index = allPosts.findIndex(p => p.id === initialPost.id);
      if (index !== -1) {
        const postElement = scrollContainerRef.current.children[index] as HTMLElement;
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'auto' });
        }
      }
    }
  }, []); // Run once on mount

  // Ref for onClose to use in effect without re-triggering
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Handle browser back button & history state
  useEffect(() => {
    // Push state when modal opens if not already in post-view
    if (!window.location.hash.includes('post-view')) {
      window.history.pushState({ modal: 'post-detail' }, '', '#post-view');
    }

    const handlePopState = () => {
      // If the hash is gone (user pressed back), close the modal
      if (!window.location.hash.includes('post-view')) {
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      
      // If unmounting and hash is still there (e.g. closed via UI button), remove it
      if (window.location.hash.includes('post-view')) {
        window.history.back();
      }
    };
  }, []);

  // Handle scroll locking with position preservation
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const activePost = allPosts.find(p => p.id === activePostId) || initialPost;

  return (
    <div className="fixed inset-0 bg-background z-[60] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background z-10">
        <button
          onClick={onClose}
          className="text-foreground hover:text-tertiary-foreground active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={2} />
        </button>
        <h2 className="text-body font-semibold text-foreground">Posts</h2>
        <div className="w-6" />
      </div>

      {/* Feed Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
      >
        {allPosts.map((post) => (
          <PostDetailItem
            key={post.id}
            post={post}
            isActive={activePostId === post.id}
            onLike={onLike}
            onRepost={onRepost}
            onSave={onSave}
            onCommentClick={(id) => {
              setActivePostId(id);
              setShowComments(true);
            }}
            onInsightsClick={(id) => {
              setActivePostId(id);
              setIsInsightsModalOpen(true);
            }}
            showInsights={showInsights}
            setActivePostId={setActivePostId}
          />
        ))}
      </div>

      {/* Comments Sheet */}
      {showComments && activePost && (
        <CommentsSheet post={activePost} onClose={() => setShowComments(false)} />
      )}

      {/* Insights Modal */}
      {isInsightsModalOpen && activePost && (
        <InsightsModal 
          postImage={activePost.mediaUrl || ''} 
          onClose={() => setIsInsightsModalOpen(false)} 
        />
      )}
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

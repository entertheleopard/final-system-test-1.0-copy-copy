import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Repeat2, Bookmark, Share2, BarChart2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useShareActions } from '@/contexts/ShareContext';
import { EmojiTray, EmojiOverlay, CaptionSwipePreview, REACTION_EMOJIS } from './EmojiReactions';
import { PostActionButton } from './PostActionButton';
import { haptics } from '@/utils/haptics';
import { handleImageError } from '@/lib/utils';
import type { Post } from '@/types/social';
import { AvatarImage } from '@/components/ui/AvatarImage';
import { useSignedUrl } from '@/hooks/useSignedUrl';

interface PostDetailItemProps {
  post: Post;
  isActive: boolean;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onSave: (postId: string) => void;
  onCommentClick: (postId: string) => void;
  onInsightsClick: (postId: string) => void;
  showInsights?: boolean;
  setActivePostId: (id: string) => void;
}

export default function PostDetailItem({
  post,
  isActive,
  onLike,
  onRepost,
  onSave,
  onCommentClick,
  onInsightsClick,
  showInsights,
  setActivePostId
}: PostDetailItemProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openShare } = useShareActions();

  const { signedUrl } = useSignedUrl(post.mediaUrl);

  // Reaction State
  const [showEmojiTray, setShowEmojiTray] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null);
  const [swipeEmoji, setSwipeEmoji] = useState<string | null>(null);

  // Refs
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lastTap = useRef<number>(0);
  const isSwiping = useRef(false);

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`, { replace: true });
  };

  // Reaction Logic
  const handleReaction = (emoji: string) => {
    setActiveReaction(prev => prev === emoji ? null : emoji);
    if (activeReaction !== emoji) {
      setAnimatingEmoji(emoji);
      haptics.success();
    } else {
      haptics.medium();
    }
    setShowEmojiTray(false);
  };

  // Long Press Handlers
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowEmojiTray(true);
      haptics.medium();
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Caption Swipe Handlers
  const handleCaptionTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isSwiping.current = false;
  };

  const handleCaptionTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const deltaX = e.touches[0].clientX - touchStart.current.x;
    const deltaY = e.touches[0].clientY - touchStart.current.y;

    if (Math.abs(deltaX) > 20 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwiping.current = true;
      if (e.cancelable) e.preventDefault();
      const index = Math.abs(Math.floor(deltaX / 40)) % REACTION_EMOJIS.length;
      const emoji = REACTION_EMOJIS[index];
      if (swipeEmoji !== emoji) {
        setSwipeEmoji(emoji);
        haptics.light();
      }
    }
  };

  const handleCaptionTouchEnd = () => {
    if (isSwiping.current && swipeEmoji) {
      handleReaction(swipeEmoji);
      setSwipeEmoji(null);
    } else {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        handleReaction(activeReaction || '❤️');
      }
      lastTap.current = now;
    }
    touchStart.current = null;
    isSwiping.current = false;
  };

  return (
    <div 
      className="min-h-full snap-start flex flex-col pb-8"
      onClick={() => setActivePostId(post.id)}
    >
      {/* Media */}
      <div 
        className="w-full aspect-[4/5] bg-black relative overflow-hidden flex-shrink-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        onMouseDown={() => handleTouchStart()}
        onMouseUp={() => handleTouchEnd()}
        onMouseLeave={() => handleTouchEnd()}
      >
        {signedUrl ? (
          post.mediaType === 'video' ? (
            <video
              src={signedUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
              loop
            />
          ) : (
            <img
              src={signedUrl}
              alt="Post content"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )
        ) : (
          <div className="w-full h-full bg-tertiary animate-pulse" />
        )}

        {/* Overlays */}
        {isActive && (
          <>
            <EmojiOverlay 
              emoji={animatingEmoji} 
              onComplete={() => setAnimatingEmoji(null)} 
            />
            <EmojiTray 
              isOpen={showEmojiTray} 
              onSelect={handleReaction} 
              onClose={() => setShowEmojiTray(false)}
              position={{ x: 50, y: 50 }}
            />
          </>
        )}
      </div>

      {/* Post Info */}
      <div className="p-4 space-y-4 bg-background">
        {/* Author */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleProfileClick(post.authorId)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity active:scale-95"
          >
            <div className="w-10 h-10 flex-shrink-0">
              <AvatarImage
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-full h-full rounded-full"
              />
            </div>
            <div className="text-left">
              <p className="text-body-sm font-semibold text-foreground">
                {post.authorName}
              </p>
              <p className="text-caption text-tertiary-foreground">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </button>
        </div>

        {/* Creator Insights Button */}
        {showInsights && user?.id === post.authorId && (
          <div className="py-1">
            <button 
              onClick={() => onInsightsClick(post.id)}
              className="w-full flex items-center justify-between py-2 px-3 bg-tertiary/50 rounded-lg text-body-sm font-medium text-foreground hover:bg-tertiary transition-colors active:scale-98"
            >
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                <span>View Insights</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <PostActionButton
              onClick={(e) => {
                e.stopPropagation();
                onLike(post.id);
              }}
              isActive={post.isLiked}
              activeClass="text-error"
            >
              <Heart
                className="w-7 h-7"
                strokeWidth={2}
                fill={post.isLiked ? 'currentColor' : 'none'}
              />
            </PostActionButton>
            <PostActionButton
              onClick={() => onCommentClick(post.id)}
            >
              <MessageCircle className="w-7 h-7" strokeWidth={2} />
            </PostActionButton>
            <PostActionButton
              onClick={(e) => {
                e.stopPropagation();
                onRepost(post.id);
              }}
            >
              <Repeat2 className="w-7 h-7" strokeWidth={2} />
            </PostActionButton>
            <PostActionButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActivePostId(post.id);
                openShare(post);
              }}
            >
              <Share2 className="w-7 h-7" strokeWidth={2} />
            </PostActionButton>
          </div>
          <PostActionButton
            onClick={(e) => {
              e.stopPropagation();
              onSave(post.id);
            }}
            isActive={post.isSaved}
            activeClass="text-primary"
          >
            <Bookmark
              className="w-7 h-7"
              strokeWidth={2}
              fill={post.isSaved ? 'currentColor' : 'none'}
            />
          </PostActionButton>
        </div>

        {/* Likes */}
        <div className="text-body-sm font-semibold text-foreground">
          {post.likes.toLocaleString()} likes
        </div>

        {/* Caption */}
        {post.content && (
          <div className="relative">
            {isActive && <CaptionSwipePreview emoji={swipeEmoji} />}
            <div 
              className="text-body-sm text-foreground select-none touch-pan-y"
              onTouchStart={handleCaptionTouchStart}
              onTouchMove={handleCaptionTouchMove}
              onTouchEnd={handleCaptionTouchEnd}
            >
              <button
                onClick={() => handleProfileClick(post.authorId)}
                className="font-semibold hover:text-tertiary-foreground transition-colors"
              >
                {post.authorName}
              </button>{' '}
              {post.content}
            </div>
          </div>
        )}

        {/* View Comments Button */}
        <button 
          onClick={() => onCommentClick(post.id)}
          className="text-body-sm text-tertiary-foreground hover:text-foreground transition-colors text-left"
        >
          View all {post.comments} comments
        </button>

      </div>
    </div>
  );
}

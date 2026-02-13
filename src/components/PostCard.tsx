import { useState, useRef, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useShareActions } from '@/contexts/ShareContext';
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, Share2, TrendingUp, Trash2, Archive } from 'lucide-react';
import FriendButton from './FriendButton';
import { EmojiTray, EmojiOverlay, CaptionSwipePreview, REACTION_EMOJIS } from './EmojiReactions';
import { PostActionButton } from './PostActionButton';
import { haptics } from '@/utils/haptics';
import type { Post } from '@/types/social';
import { cn, handleImageError, resolveMedia } from '@/lib/utils';
import { AvatarImage } from '@/components/ui/AvatarImage';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onRepost: (postId: string) => void;
  onSave: (postId: string) => void;
  onMediaClick: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onArchive?: (postId: string) => void;
  isEdgeToEdge?: boolean;
}

function PostCard({ 
  post, 
  onLike, 
  onComment, 
  onRepost, 
  onSave, 
  onMediaClick,
  onDelete,
  onArchive,
  isEdgeToEdge = false
}: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openShare } = useShareActions();
  
  // Reaction State
  const [showEmojiTray, setShowEmojiTray] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [animatingEmoji, setAnimatingEmoji] = useState<string | null>(null);
  const [swipeEmoji, setSwipeEmoji] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});

  // Touch/Gesture Refs
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lastTap = useRef<number>(0);
  const isSwiping = useRef(false);

  const isOwnPost = user?.id === post.authorId;
  const media = resolveMedia(post);
  const { signedUrl } = useSignedUrl(media?.url);
  
  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Trending Logic: > 25 engagements
  const totalEngagement = post.likes + post.comments + post.reposts + post.saves;
  const isTrending = totalEngagement > 25;

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.authorId}`);
  };

  // Reaction Logic
  const handleReaction = (emoji: string) => {
    const isRemoving = activeReaction === emoji;
    
    // Update local state
    setActiveReaction(prev => isRemoving ? null : emoji);
    
    // Update counts locally
    setReactionCounts(prev => {
      const next = { ...prev };
      if (activeReaction) {
        next[activeReaction] = Math.max(0, (next[activeReaction] || 0) - 1);
      }
      if (!isRemoving) {
        next[emoji] = (next[emoji] || 0) + 1;
      }
      return next;
    });

    // Sync with parent "Like" state
    if (isRemoving) {
      // We are removing the reaction. If post is liked, unlike it.
      if (post.isLiked) onLike(post.id);
    } else {
      // We are adding or changing reaction.
      // If post is NOT liked, like it.
      if (!post.isLiked) onLike(post.id);
      // If post IS liked, we are just changing emoji, so don't toggle parent (which would unlike).
    }

    if (!isRemoving) {
      setAnimatingEmoji(emoji);
      haptics.success();
    } else {
      haptics.medium();
    }
    
    setShowEmojiTray(false);
  };

  // Long Press Handler for Like Button
  const handleLikeLongPress = () => {
    setShowEmojiTray(true);
    haptics.medium();
  };

  // Media Tap Handler (Single vs Double Tap)
  const handleMediaTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double Tap -> Like (Thumbs Up)
      handleReaction('👍');
    } else {
      // Single Tap
      if (post.id.startsWith('live-')) {
        // Special case for Live posts: Navigate to watch
        onMediaClick(post);
      } else if (media?.type === 'video') {
        // Video: Toggle Play/Pause
        const video = videoRef.current;
        if (video) {
          if (video.paused) {
            video.play().catch(() => {});
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        }
      }
      // Image: No action
    }
    lastTap.current = now;
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  // Caption Swipe & Double Tap Handlers
  const handleCaptionTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isSwiping.current = false;
  };

  const handleCaptionTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;

    const deltaX = e.touches[0].clientX - touchStart.current.x;
    const deltaY = e.touches[0].clientY - touchStart.current.y;

    // Detect horizontal swipe
    if (Math.abs(deltaX) > 20 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwiping.current = true;
      if (e.cancelable) e.preventDefault(); // Prevent scrolling

      // Cycle emojis based on distance
      const index = Math.abs(Math.floor(deltaX / 40)) % REACTION_EMOJIS.length;
      const emoji = REACTION_EMOJIS[index];
      
      if (swipeEmoji !== emoji) {
        setSwipeEmoji(emoji);
        haptics.light();
      }
    }
  };

  const handleCaptionTouchEnd = (e: React.TouchEvent) => {
    if (isSwiping.current && swipeEmoji) {
      handleReaction(swipeEmoji);
      setSwipeEmoji(null);
    } else {
      // Double tap detection on caption
      const now = Date.now();
      if (now - lastTap.current < 300) {
        handleReaction(activeReaction || '👍');
      }
      lastTap.current = now;
    }
    
    touchStart.current = null;
    isSwiping.current = false;
  };

  return (
    <article className={cn(
      "bg-background mb-4 relative will-change-transform content-visibility-auto",
      isEdgeToEdge 
        ? "" 
        : "border border-border rounded-lg"
    )}>
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1">
          <button 
            onClick={handleProfileClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity active:opacity-60"
          >
            <div className="w-10 h-10 flex-shrink-0">
              <AvatarImage
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-full h-full rounded-full cursor-pointer"
              />
            </div>
            <div>
              <p className="text-body-sm font-semibold text-foreground cursor-pointer hover:text-tertiary-foreground transition-colors">
                {post.authorName}
              </p>
              <div className="flex items-center gap-2 text-caption text-tertiary-foreground">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {isTrending && (
                  <span className="flex items-center gap-1 text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                    <TrendingUp className="w-3 h-3" />
                    Trending
                  </span>
                )}
              </div>
            </div>
          </button>
          
          {!isOwnPost && (
            <FriendButton userId={post.authorId} variant="compact" className="ml-auto" />
          )}
        </div>
        
        {isOwnPost && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="text-tertiary-foreground hover:text-foreground transition-colors ml-2 active:opacity-60 p-1 -mr-1 outline-none"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <button
                onClick={() => onArchive?.(post.id)}
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground gap-2"
              >
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </button>
              <button
                onClick={() => onDelete?.(post.id)}
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground gap-2 text-error"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      {/* Media */}
      {media && signedUrl && (
        <div
          className={cn(
            "w-full bg-tertiary cursor-pointer relative overflow-hidden aspect-[4/5] active:opacity-95 transition-opacity",
            isEdgeToEdge ? "" : "rounded-none sm:rounded-md"
          )}
          onClick={handleMediaTap}
        >
          {media.type === 'video' ? (
            <>
              <video
                ref={videoRef}
                src={signedUrl}
                className="w-full h-full absolute inset-0 object-cover block mx-auto"
                controls={false}
                playsInline
                loop
                muted={isMuted}
              />
              {/* Mute Icon Overlay */}
              <button
                onClick={toggleMute}
                className="absolute bottom-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors z-20"
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                )}
              </button>
              {/* Play/Pause Indicator (Optional, fades out) */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10">
                  <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                </div>
              )}
            </>
          ) : (
            <img
              src={signedUrl}
              alt="Post content"
              className="w-full h-full absolute inset-0 object-cover block mx-auto"
              onError={handleImageError}
              loading="lazy"
            />
          )}

          {/* Overlays */}
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
        </div>
      )}
      {media && !signedUrl && (
        <div className={cn(
          "w-full bg-tertiary animate-pulse aspect-[4/5]",
          isEdgeToEdge ? "" : "rounded-none sm:rounded-md"
        )} />
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <PostActionButton
              onClick={(e) => {
                e.stopPropagation();
                if (post.isLiked) {
                  // If liked, treat as removing current reaction
                  if (activeReaction) {
                    handleReaction(activeReaction);
                  } else {
                    // Fallback for "Liked but unknown emoji" -> Just unlike
                    onLike(post.id);
                  }
                } else {
                  // Not liked -> Like with default Heart
                  handleReaction('❤️');
                }
              }}
              onLongPress={handleLikeLongPress}
              isActive={post.isLiked}
              activeClass="text-error"
            >
              <Heart
                className="w-6 h-6"
                strokeWidth={2}
                fill={post.isLiked ? 'currentColor' : 'none'}
              />
            </PostActionButton>
            <PostActionButton
              onClick={() => onComment(post.id)}
            >
              <MessageCircle className="w-6 h-6" strokeWidth={2} />
            </PostActionButton>
            <PostActionButton
              onClick={() => onRepost(post.id)}
            >
              <Repeat2 className="w-6 h-6" strokeWidth={2} />
            </PostActionButton>
            <PostActionButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // e.currentTarget.blur(); // Not needed with PostActionButton handling focus
                openShare(post);
              }}
            >
              <Share2 className="w-6 h-6" strokeWidth={2} />
            </PostActionButton>
          </div>
          <PostActionButton
            onClick={() => onSave(post.id)}
            isActive={post.isSaved}
            activeClass="text-primary"
          >
            <Bookmark
              className="w-6 h-6"
              strokeWidth={2}
              fill={post.isSaved ? 'currentColor' : 'none'}
            />
          </PostActionButton>
        </div>

        {/* Stats */}
        <div className="mb-2">
          <p className="text-body-sm font-semibold text-foreground">
            {post.likes.toLocaleString()} likes
          </p>
        </div>

        {/* Reaction Counts */}
        {(Object.keys(reactionCounts).length > 0 || activeReaction) && (
          <div className="flex gap-1 mb-2">
            {Object.entries(reactionCounts).map(([emoji, count]) => count > 0 && (
              <span key={emoji} className="text-xs bg-tertiary px-1.5 py-0.5 rounded-full">
                {emoji} {count}
              </span>
            ))}
            {activeReaction && !reactionCounts[activeReaction] && (
              <span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20">
                {activeReaction} 1
              </span>
            )}
          </div>
        )}

        {/* Content */}
        {post.content && (
          <div className="relative">
            <CaptionSwipePreview emoji={swipeEmoji} />
            <p 
              className="text-body-sm text-foreground mb-2 select-none touch-pan-y"
              onTouchStart={handleCaptionTouchStart}
              onTouchMove={handleCaptionTouchMove}
              onTouchEnd={handleCaptionTouchEnd}
            >
              <button
                onClick={handleProfileClick}
                className="font-semibold hover:text-tertiary-foreground transition-colors active:opacity-60"
              >
                {post.authorName}
              </button>{' '}
              {post.content}
            </p>
          </div>
        )}

        {/* Comments */}
        {post.comments > 0 && (
          <button
            onClick={() => onComment(post.id)}
            className="text-body-sm text-tertiary-foreground hover:text-foreground transition-colors active:opacity-60"
          >
            View all {post.comments} comments
          </button>
        )}
      </div>
    </article>
  );
}

export default memo(PostCard);

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import type { Post } from '@/types/social';
import { cn } from '@/lib/utils';
import { AvatarImage } from '@/components/ui/AvatarImage';

interface CommentsSheetProps {
  post: Post;
  onClose: () => void;
}

interface CommentReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface Comment {
  id: string;
  author: string;
  authorId?: string;
  avatar: string;
  text: string;
  timestamp: string;
  reactions: Record<string, CommentReaction>; // emoji -> reaction data
  replies?: Comment[];
}

const AVAILABLE_REACTIONS = ['❤️', '😂', '😮', '😢', '🔥', '👍'];

export default function CommentsSheet({ post, onClose }: CommentsSheetProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const [activeReactionId, setActiveReactionId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  
  const sheetRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    // Prevent body scroll when sheet is open
    document.body.style.overflow = 'hidden';
    
    // Handle ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Match animation duration
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: user?.name || 'You',
      authorId: user?.id,
      avatar: user?.profilePictureUrl || '',
      text: commentText,
      timestamp: 'Just now',
      reactions: {},
      replies: []
    };

    if (replyingTo) {
      setComments(prevComments => prevComments.map(c => {
        // If replying to this top-level comment
        if (c.id === replyingTo.id) {
          return { ...c, replies: [...(c.replies || []), newComment] };
        }
        // If replying to a reply within this comment (shallow nesting)
        if (c.replies?.some(r => r.id === replyingTo.id)) {
          return { ...c, replies: [...(c.replies || []), newComment] };
        }
        return c;
      }));

      // Trigger Notification for Reply
      createNotification({
        type: 'reply',
        fromUserId: user?.id || '',
        toUserId: replyingTo.authorId || '',
        postId: post.id,
        commentId: replyingTo.id,
        previewText: commentText
      });

      setReplyingTo(null);
    } else {
      setComments([newComment, ...comments]);

      // Trigger Notification for Comment
      createNotification({
        type: 'comment',
        fromUserId: user?.id || '',
        toUserId: post.authorId,
        postId: post.id,
        previewText: commentText
      });
    }
    setCommentText('');
  };

  const handleReplyClick = (comment: Comment) => {
    setReplyingTo(comment);
    setCommentText(`@${comment.author} `);
    inputRef.current?.focus();
  };

  const toggleLike = (commentId: string) => {
    // Find the comment to check its current reaction state
    const findComment = (comments: Comment[]): Comment | undefined => {
      for (const c of comments) {
        if (c.id === commentId) return c;
        if (c.replies) {
          const found = findComment(c.replies);
          if (found) return found;
        }
      }
      return undefined;
    };

    const comment = findComment(comments);
    if (!comment) return;

    // Check if user has ANY reaction
    const userReaction = Object.values(comment.reactions).find(r => r.userReacted);
    
    if (userReaction) {
      // If user has reacted (with anything), remove it
      handleReaction(commentId, userReaction.emoji);
    } else {
      // If no reaction, add default Heart
      handleReaction(commentId, '❤️');
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleReaction = (commentId: string, emoji: string) => {
    const updateReactions = (c: Comment) => {
      const newReactions = { ...c.reactions };
      const existingReaction = newReactions[emoji];

      if (existingReaction?.userReacted) {
        if (existingReaction.count <= 1) {
          delete newReactions[emoji];
        } else {
          newReactions[emoji] = {
            ...existingReaction,
            count: existingReaction.count - 1,
            userReacted: false
          };
        }
      } else {
        Object.keys(newReactions).forEach(key => {
          if (newReactions[key].userReacted) {
            if (newReactions[key].count <= 1) {
              delete newReactions[key];
            } else {
              newReactions[key] = {
                ...newReactions[key],
                count: newReactions[key].count - 1,
                userReacted: false
              };
            }
          }
        });

        newReactions[emoji] = {
          emoji,
          count: (newReactions[emoji]?.count || 0) + 1,
          userReacted: true
        };
      }
      return { ...c, reactions: newReactions };
    };

    setComments(comments.map(c => {
      if (c.id === commentId) return updateReactions(c);
      
      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: c.replies.map(r => r.id === commentId ? updateReactions(r) : r)
        };
      }
      
      return c;
    }));
    setActiveReactionId(null);
  };

  // Long press handling for Like button
  const handleLikeTouchStart = (commentId: string) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setActiveReactionId(commentId);
    }, 500); // 500ms long press
  };

  const handleLikeTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleLikeClick = (commentId: string) => {
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    toggleLike(commentId);
  };

  // Touch handling for drag-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow dragging if we're at the top of the scroll container
    // or touching the handle area
    const target = e.target as HTMLElement;
    const scrollContainer = sheetRef.current?.querySelector('.overflow-y-auto');
    
    // If touching inside scroll container and it's scrolled down, don't drag sheet
    if (scrollContainer && scrollContainer.scrollTop > 0 && !target.closest('.drag-handle')) {
      return;
    }

    isDragging.current = true;
    setIsDraggingSheet(true);
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    // Only allow dragging downwards
    if (diff > 0) {
      e.preventDefault(); // Prevent scrolling while dragging
      setDragOffset(diff);
    } else {
      // Resistance when pulling up
      setDragOffset(diff * 0.2);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsDraggingSheet(false);

    const currentY = e.changedTouches[0].clientY;
    const diff = currentY - startY.current;
    const velocity = diff / 200; // Simple velocity approximation

    // Close if dragged far enough or fast enough
    if (diff > 150 || (diff > 50 && velocity > 0.5)) {
      handleClose();
    } else {
      setDragOffset(0);
    }
  };

  const handleProfileNavigation = (userId: string | undefined, username: string) => {
    if (userId) {
      navigate(`/profile/${userId}`);
    } else {
      navigate(`/profile/${username}`);
    }
    onClose();
  };

  const handleMentionClick = (username: string) => {
    // Try to find user in comments to get their ID
    const found = comments.find(c => c.author === username) || 
                  comments.flatMap(c => c.replies || []).find(r => r.author === username);
    
    handleProfileNavigation(found?.authorId, username);
  };

  const getTotalReactions = (c: Comment) => {
    return Object.values(c.reactions).reduce((acc, r) => acc + r.count, 0);
  };

  const getUserReaction = (c: Comment) => {
    return Object.values(c.reactions).find(r => r.userReacted);
  };

  const renderWithMentions = (text: string) => {
    // Split by mention pattern (@username)
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);
        return (
          <span 
            key={index} 
            className="text-primary font-semibold cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              handleMentionClick(username);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-300",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div 
        ref={sheetRef}
        className={cn(
          "relative w-full max-w-md bg-background rounded-t-2xl shadow-xl flex flex-col max-h-[85vh] transition-transform ease-out will-change-transform",
          isClosing ? "translate-y-full" : "translate-y-0"
        )}
        style={{ 
          transform: isClosing ? 'translateY(100%)' : `translateY(${dragOffset}px)`,
          transition: isDraggingSheet ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing drag-handle touch-none">
          <div className="w-12 h-1.5 bg-tertiary-foreground/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-center p-3 border-b border-border relative">
          <h3 className="text-body font-semibold text-foreground">Comments</h3>
          <button 
            onClick={handleClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground hover:text-tertiary-foreground p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comments List */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0 overscroll-contain"
          onClick={() => setActiveReactionId(null)} // Close picker on background click
        >
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-h3 mb-2">No comments yet</p>
              <p className="text-body-sm text-tertiary-foreground">Start the conversation.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className="flex gap-3 group relative"
                onContextMenu={(e) => e.preventDefault()} // Prevent native menu
              >
                <div 
                  className="w-8 h-8 flex-shrink-0 cursor-pointer active:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileNavigation(comment.authorId, comment.author);
                  }}
                >
                  <AvatarImage
                    src={comment.avatar}
                    alt={comment.author}
                    className="w-full h-full rounded-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProfileNavigation(comment.authorId, comment.author);
                      }}
                      className="text-body-sm font-semibold text-foreground hover:underline"
                    >
                      {comment.author}
                    </button>
                    <span className="text-caption text-tertiary-foreground">
                      {comment.timestamp}
                    </span>
                  </div>
                  
                  {/* Comment Bubble */}
                  <div 
                    className={cn(
                      "relative inline-block",
                      activeReactionId === comment.id && "z-20"
                    )}
                  >
                    <p className="text-body-sm text-foreground leading-snug break-words">
                      {renderWithMentions(comment.text)}
                    </p>

                    {/* Reaction Picker Popover */}
                    {activeReactionId === comment.id && (
                      <div className="absolute -top-12 left-0 bg-background border border-border shadow-lg rounded-full px-2 py-1 flex gap-1 animate-in zoom-in duration-200 z-50">
                        {AVAILABLE_REACTIONS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReaction(comment.id, emoji);
                            }}
                            className="hover:scale-125 transition-transform p-1 text-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reactions Display */}
                  {Object.keys(comment.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.values(comment.reactions).map((reaction) => (
                        <div
                          key={reaction.emoji}
                          className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-default",
                            reaction.userReacted 
                              ? "bg-primary/10 text-primary border border-primary/20" 
                              : "bg-tertiary text-foreground border border-transparent"
                          )}
                        >
                          <span>{reaction.emoji}</span>
                          <span>{reaction.count}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={() => handleReplyClick(comment)}
                    className="text-caption text-tertiary-foreground font-semibold mt-1 ml-2 hover:text-foreground"
                  >
                    Reply
                  </button>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {/* Render visible replies based on expansion state */}
                      {(expandedComments[comment.id] ? comment.replies : [comment.replies[0]]).map((reply) => (
                        <div 
                          key={reply.id} 
                          className="flex gap-3 group relative"
                        >
                          <div 
                            className="w-6 h-6 flex-shrink-0 cursor-pointer active:opacity-80 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProfileNavigation(reply.authorId, reply.author);
                            }}
                          >
                            <AvatarImage
                              src={reply.avatar}
                              alt={reply.author}
                              className="w-full h-full rounded-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProfileNavigation(reply.authorId, reply.author);
                                }}
                                className="text-body-sm font-semibold text-foreground hover:underline"
                              >
                                {reply.author}
                              </button>
                              <span className="text-caption text-tertiary-foreground">
                                {reply.timestamp}
                              </span>
                            </div>
                            
                            <div 
                              className={cn("relative inline-block", activeReactionId === reply.id && "z-20")}
                            >
                              <p className="text-body-sm text-foreground leading-snug break-words">
                                {renderWithMentions(reply.text)}
                              </p>
                              {activeReactionId === reply.id && (
                                <div className="absolute -top-12 left-0 bg-background border border-border shadow-lg rounded-full px-2 py-1 flex gap-1 animate-in zoom-in duration-200 z-50">
                                  {AVAILABLE_REACTIONS.map(emoji => (
                                    <button
                                      key={emoji}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReaction(reply.id, emoji);
                                      }}
                                      className="hover:scale-125 transition-transform p-1 text-lg"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {Object.keys(reply.reactions).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.values(reply.reactions).map((reaction) => (
                                  <div
                                    key={reaction.emoji}
                                    className={cn(
                                      "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-default",
                                      reaction.userReacted 
                                        ? "bg-primary/10 text-primary border border-primary/20" 
                                        : "bg-tertiary text-tertiary-foreground border border-transparent"
                                    )}
                                  >
                                    <span>{reaction.emoji}</span>
                                    <span>{reaction.count}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <button 
                              onClick={() => handleReplyClick(reply)}
                              className="text-caption text-tertiary-foreground font-semibold mt-1 ml-2 hover:text-foreground"
                            >
                              Reply
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => handleLikeClick(reply.id)}
                            onTouchStart={() => handleLikeTouchStart(reply.id)}
                            onTouchEnd={handleLikeTouchEnd}
                            onTouchCancel={handleLikeTouchEnd}
                            className="flex flex-col items-center gap-1 pt-1 px-1 active:scale-90 transition-transform"
                          >
                            {getUserReaction(reply) ? (
                              <span className="text-sm leading-none">{getUserReaction(reply)?.emoji}</span>
                            ) : (
                              <Heart className="w-3 h-3 text-foreground transition-colors" />
                            )}
                            <span className="text-[10px] text-tertiary-foreground">
                              {getTotalReactions(reply) > 0 ? getTotalReactions(reply) : ''}
                            </span>
                          </button>
                        </div>
                      ))}

                      {/* View/Hide Replies Control */}
                      {comment.replies.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReplies(comment.id);
                          }}
                          className="text-caption text-tertiary-foreground font-semibold pl-9 flex items-center gap-3 hover:text-foreground transition-colors"
                        >
                          <div className="w-8 h-[1px] bg-border" />
                          {expandedComments[comment.id] 
                            ? 'Hide replies' 
                            : `View ${comment.replies.length - 1} more replies`
                          }
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                  <button 
                    onClick={() => handleLikeClick(comment.id)}
                    onTouchStart={() => handleLikeTouchStart(comment.id)}
                    onTouchEnd={handleLikeTouchEnd}
                    onTouchCancel={handleLikeTouchEnd}
                    className="flex flex-col items-center gap-1 pt-1 px-1 active:scale-90 transition-transform"
                  >
                    {getUserReaction(comment) ? (
                      <span className="text-lg leading-none">{getUserReaction(comment)?.emoji}</span>
                    ) : (
                      <Heart className="w-4 h-4 text-foreground transition-colors" />
                    )}
                    <span className="text-[10px] text-tertiary-foreground">
                      {getTotalReactions(comment) > 0 ? getTotalReactions(comment) : ''}
                    </span>
                  </button>
              </div>
            ))
          )}
        </div>

        {/* Input Area - Pinned to bottom */}
        <div className="p-3 border-t border-border bg-background safe-bottom">
          {replyingTo && (
            <div className="flex items-center justify-between px-2 mb-2 text-caption text-tertiary-foreground">
              <span>Replying to <span className="font-semibold text-foreground">{replyingTo.author}</span></span>
              <button onClick={() => {
                setReplyingTo(null);
                setCommentText('');
              }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="w-8 h-8 flex-shrink-0">
              <AvatarImage
                src={user?.profilePictureUrl}
                alt="Your avatar"
                className="w-full h-full rounded-full"
              />
            </div>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`Add a comment for ${post.authorName}...`}
                className="w-full pl-4 pr-10 py-2.5 bg-tertiary rounded-full text-body-sm text-foreground placeholder:text-tertiary-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary disabled:opacity-50 disabled:cursor-not-allowed p-1.5 hover:bg-primary/10 rounded-full transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

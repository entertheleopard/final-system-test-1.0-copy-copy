import { useState, useEffect, useRef } from 'react';
import { cn, handleAvatarError } from '@/lib/utils';

interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  color?: string;
}

const MOCK_COMMENTS: any[] = [];
const AVATARS: string[] = [];

const COLORS = [
  'text-white',
  'text-yellow-300',
  'text-cyan-300',
  'text-pink-300',
];

import { Pin } from 'lucide-react';

export default function LiveComments({ isBroadcaster = false, isCommentsEnabled = true }: { isBroadcaster?: boolean; isCommentsEnabled?: boolean }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pinnedComment, setPinnedComment] = useState<Comment | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCommentsEnabled) return;

    // Simulate incoming comments
    const interval = setInterval(() => {
      if (Math.random() > 0.3) return; // Randomize frequency

      const randomComment = MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)];
      const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

      const newComment: Comment = {
        id: Date.now().toString() + Math.random().toString(),
        username: randomComment.username,
        avatar: randomAvatar,
        text: randomComment.text,
        color: randomColor,
      };

      setComments(prev => [...prev.slice(-15), newComment]); // Keep last 15 comments

      // Auto scroll to bottom
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCommentsEnabled]);

  const handleCommentClick = (comment: Comment) => {
    if (isBroadcaster) {
      // Toggle pin
      setPinnedComment(prev => prev?.id === comment.id ? null : comment);
    }
  };

  if (!isCommentsEnabled) {
    return (
      <div className={cn("w-full p-4 text-center", isBroadcaster ? "mb-20" : "mb-16")}>
        <p className="text-white/50 text-sm italic">Comments are turned off</p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", isBroadcaster ? "mb-20" : "mb-16")}>
      {/* Pinned Comment Overlay */}
      {pinnedComment && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-black/40 backdrop-blur-md border-l-4 border-yellow-400 rounded-r-lg p-2 animate-in slide-in-from-left duration-300 z-10">
          <div className="flex items-start gap-2">
            <Pin className="w-3 h-3 text-yellow-400 mt-1 flex-shrink-0" fill="currentColor" />
            <div>
              <p className="text-xs font-bold text-yellow-400 mb-0.5">Pinned</p>
              <p className="text-xs font-bold text-white/90">{pinnedComment.username}</p>
              <p className="text-sm text-white">{pinnedComment.text}</p>
            </div>
            {isBroadcaster && (
              <button 
                onClick={() => setPinnedComment(null)}
                className="ml-auto text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div 
        ref={containerRef}
        className="w-full h-64 overflow-y-auto no-scrollbar flex flex-col justify-end space-y-2 p-4 mask-image-gradient"
        style={{ 
          maskImage: 'linear-gradient(to bottom, transparent, black 20%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%)' 
        }}
      >
        {comments.map((comment) => (
          <div 
            key={comment.id} 
            onClick={() => handleCommentClick(comment)}
            className={cn(
              "flex items-start gap-2 animate-in slide-in-from-bottom-4 fade-in duration-300",
              isBroadcaster && "cursor-pointer active:opacity-80"
            )}
          >
            <img 
              src={comment.avatar} 
              alt={comment.username} 
              className="w-8 h-8 rounded-full border border-white/20 object-cover flex-shrink-0"
              onError={handleAvatarError}
            />
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl rounded-tl-none px-3 py-1.5 max-w-[80%]">
              <p className="text-xs font-bold text-white/70 mb-0.5">{comment.username}</p>
              <p className={cn("text-sm font-medium leading-snug", comment.color || 'text-white')}>
                {comment.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

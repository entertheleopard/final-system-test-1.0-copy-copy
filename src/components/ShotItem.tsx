import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, Volume2, VolumeX, Share2, Search } from 'lucide-react';
import FriendButton from './FriendButton';
import { handleAvatarError, handleImageError, resolveMedia } from '@/lib/utils';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import type { Post } from '@/types/social';

interface ShotItemProps {
  shot: Post;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (shot: Post) => void;
  onSave: (id: string) => void;
  currentUserId?: string;
}

export default function ShotItem({
  shot,
  isActive,
  isMuted,
  onMuteToggle,
  onLike,
  onComment,
  onShare,
  onSave,
  currentUserId
}: ShotItemProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const media = resolveMedia(shot);
  const { signedUrl } = useSignedUrl(media?.url);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !signedUrl) return;

    if (isActive) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive, signedUrl]);

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div 
      data-post-id={shot.id}
      className="w-full h-full snap-start relative flex items-center justify-center bg-black"
    >
      {/* Media */}
      <div className="relative w-full h-full max-w-md mx-auto">
        {signedUrl ? (
          media?.type === 'video' ? (
            <video
              ref={videoRef}
              src={signedUrl}
              className="w-full h-full object-cover"
              loop
              muted={isMuted}
              playsInline
            />
          ) : (
            <img
              src={signedUrl}
              alt={shot.content}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )
        ) : (
          <div className="w-full h-full bg-gray-900 animate-pulse" />
        )}

        {/* Overlay UI */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
          {/* Top Info */}
          <div className="flex items-center justify-between pointer-events-auto mt-14 lg:mt-4">
            <div className="flex items-center gap-3">
              <img
                src={shot.authorAvatar}
                alt={shot.authorName}
                className="w-10 h-10 rounded-full border-2 border-white"
                onError={handleAvatarError}
              />
              <span className="text-white font-semibold text-body shadow-black drop-shadow-md">
                {shot.authorName}
              </span>
              {currentUserId !== shot.authorId && (
                <FriendButton userId={shot.authorId} variant="compact" className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30" />
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/search')}
                className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={onMuteToggle}
                className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Info & Actions */}
          <div className="flex items-end justify-between pointer-events-auto pb-4 lg:pb-8">
            <div className="flex-1 text-white mr-12">
              <p className="text-body mb-2 drop-shadow-md">{shot.content}</p>
              <div className="flex items-center gap-2 text-white/80 text-caption">
                <div className="w-4 h-4 bg-white/20 rounded-sm animate-pulse" />
                <span>Original Audio</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => onLike(shot.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm group-active:scale-90 transition-transform">
                  <Heart
                    className={`w-7 h-7 ${
                      shot.isLiked ? 'text-error fill-error' : 'text-white'
                    }`}
                    strokeWidth={2}
                  />
                </div>
                <span className="text-white text-caption font-semibold drop-shadow-md">
                  {formatCount(shot.likes)}
                </span>
              </button>

              <button 
                onClick={() => onComment(shot.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm group-active:scale-90 transition-transform">
                  <MessageCircle className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <span className="text-white text-caption font-semibold drop-shadow-md">
                  {formatCount(shot.comments)}
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.blur();
                  onShare(shot);
                }}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm group-active:scale-90 transition-transform">
                  <Share2 className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <span className="text-white text-caption font-semibold drop-shadow-md">
                  Share
                </span>
              </button>

              <button
                onClick={() => onSave(shot.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm group-active:scale-90 transition-transform">
                  <Bookmark
                    className={`w-7 h-7 ${
                      shot.isSaved ? 'text-primary fill-primary' : 'text-white'
                    }`}
                    strokeWidth={2}
                  />
                </div>
              </button>
              
              <div className="w-8 h-8 rounded-md border-2 border-white overflow-hidden mt-2">
                <img 
                  src={shot.authorAvatar} 
                  alt="Music" 
                  className="w-full h-full object-cover animate-spin-slow" 
                  onError={handleAvatarError}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

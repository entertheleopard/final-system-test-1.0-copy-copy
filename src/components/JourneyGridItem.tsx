import { handleImageError, resolveMedia } from '@/lib/utils';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import type { Post } from '@/types/social';

interface JourneyGridItemProps {
  post: Post;
  onClick: (post: Post) => void;
}

export default function JourneyGridItem({ post, onClick }: JourneyGridItemProps) {
  const media = resolveMedia(post);
  const { signedUrl } = useSignedUrl(media?.url);

  const formatCount = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(num);
  };

  return (
    <div
      className="break-inside-avoid mb-1 sm:mb-2 bg-tertiary cursor-pointer relative group overflow-hidden rounded-sm"
      onClick={() => onClick(post)}
    >
      {signedUrl ? (
        media?.type === 'video' ? (
          <video
            src={signedUrl}
            className="w-full h-auto object-cover block"
            muted
            playsInline
          />
        ) : (
          <img
            src={signedUrl}
            alt={post.content}
            className="w-full h-auto object-cover block"
            loading="lazy"
            onError={handleImageError}
          />
        )
      ) : (
        <div className="w-full h-48 bg-tertiary animate-pulse" />
      )}
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-white p-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span className="text-xs sm:text-base font-bold">{formatCount(post.likes)}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
          </svg>
          <span className="text-xs sm:text-base font-bold">{formatCount(post.comments)}</span>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { cn, getFallbackAvatar } from '@/lib/utils';
import { useSignedUrl } from '@/hooks/useSignedUrl';

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  fallbackSrc?: string;
}

export function AvatarImage({ src, fallbackSrc, className, alt, ...props }: AvatarImageProps) {
  const { signedUrl, isLoading: isSigning } = useSignedUrl(src);
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  
  // Reset status when src or signedUrl changes
  useEffect(() => {
    if (!src) {
      setImageStatus('error');
    } else if (isSigning) {
      setImageStatus('loading');
    } else if (!signedUrl) {
      setImageStatus('error');
    } else {
      setImageStatus('loading');
    }
  }, [src, signedUrl, isSigning]);

  const fallback = fallbackSrc || getFallbackAvatar();

  return (
    <div className={cn("relative overflow-hidden bg-secondary/50", className)}>
      {/* Fallback (Always rendered behind, or visible if error/loading) */}
      <img 
        src={fallback} 
        alt={alt || "Avatar placeholder"}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Shimmer Overlay (Visible only while loading) */}
      {(imageStatus === 'loading' || isSigning) && src && (
        <div className="absolute inset-0 bg-white/20 animate-pulse z-10" />
      )}

      {/* Real Image */}
      {signedUrl && !isSigning && (
        <img
          src={signedUrl}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-20",
            imageStatus === 'loaded' ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageStatus('loaded')}
          onError={() => setImageStatus('error')}
          {...props}
        />
      )}
    </div>
  );
}

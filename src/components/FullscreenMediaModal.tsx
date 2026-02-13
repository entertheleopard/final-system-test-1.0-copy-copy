import { X } from 'lucide-react';
import type { Post } from '@/types/social';

interface FullscreenMediaModalProps {
  post: Post;
  onClose: () => void;
}

export default function FullscreenMediaModal({ post, onClose }: FullscreenMediaModalProps) {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
      >
        <X className="w-8 h-8" strokeWidth={2} />
      </button>

      <div className="w-full h-full flex items-center justify-center bg-black">
        {post.mediaType === 'video' ? (
          <video
            src={post.mediaUrl}
            className="w-full h-full object-cover"
            controls
            autoPlay
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt="Fullscreen content"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
}

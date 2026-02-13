import { useState } from 'react';
import InstagramLayout from '@/components/InstagramLayout';
import FullscreenMediaModal from '@/components/FullscreenMediaModal';
import { handleImageError, resolveMedia, getRandomMockImage } from '@/lib/utils';
import type { Post } from '@/types/social';

export default function ExplorePage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const explorePosts: Post[] = [];

  return (
    <InstagramLayout>
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <h1 className="text-h1 font-bold text-foreground mb-4 sm:mb-6">Journey</h1>

        {/* Grid Layout */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {explorePosts.map(post => {
            const media = resolveMedia(post);
            return (
              <div
                key={post.id}
                className="aspect-square bg-tertiary cursor-pointer relative group overflow-hidden"
                onClick={() => setSelectedPost(post)}
              >
                {media?.type === 'video' ? (
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={media?.url}
                    alt={post.content}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-h4 font-semibold">{post.likes.toLocaleString()}</span>
                    <span className="text-body-sm">likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-h4 font-semibold">{post.comments}</span>
                    <span className="text-body-sm">comments</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Media Modal */}
      {selectedPost && (
        <FullscreenMediaModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </InstagramLayout>
  );
}

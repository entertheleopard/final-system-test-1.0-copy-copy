import { useState } from 'react';
import { X, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { handleAvatarError, handleImageError } from '@/lib/utils';
import type { Post } from '@/types/social';

interface StorySharePreviewProps {
  post: Post;
  onClose: () => void;
  onBack: () => void;
}

export default function StorySharePreview({ post, onClose, onBack }: StorySharePreviewProps) {
  const { toast } = useToast();
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState(0.8);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);

  const handlePublish = () => {
    // Show unavailable modal since backend story publishing isn't implemented
    setShowUnavailableModal(true);
  };

  const handleCloseUnavailableModal = () => {
    setShowUnavailableModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <button onClick={onBack} className="hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-body font-semibold">Share to Story</h2>
        <button onClick={onClose} className="hover:opacity-80 transition-opacity">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Story Preview Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />

        {/* Post Preview (draggable/scalable) */}
        <div
          className="absolute bg-white rounded-lg shadow-2xl overflow-hidden cursor-move"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: `translate(-50%, -50%) scale(${scale})`,
            width: '280px',
            maxWidth: '80vw',
          }}
        >
          {/* Post Content */}
          <div className="relative">
            {post.mediaUrl && (
              <img
                src={post.mediaUrl}
                alt="Post preview"
                className="w-full aspect-square object-cover"
                onError={handleImageError}
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <div className="flex items-center gap-2">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-8 h-8 rounded-full border-2 border-white"
                  onError={handleAvatarError}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-body-sm font-semibold truncate">
                    {post.authorName}
                  </p>
                  {post.content && (
                    <p className="text-white/90 text-caption truncate">
                      {post.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-32 left-0 right-0 text-center text-white/80 text-body-sm px-4">
          <p>Drag to reposition • Pinch to resize</p>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-black/50 backdrop-blur-sm">
        {/* Scale Slider */}
        <div className="mb-4">
          <label className="text-white text-body-sm mb-2 block">Size</label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
        </div>

        {/* Publish Button */}
        <Button
          onClick={handlePublish}
          className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
        >
          Share to Your Story
        </Button>
      </div>

      {/* Feature Unavailable Modal */}
      {showUnavailableModal && (
        <div className="fixed inset-0 bg-black/70 z-10 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-sm w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-h3 font-semibold text-foreground text-center mb-2">
              Feature Unavailable
            </h3>
            <p className="text-body text-tertiary-foreground text-center mb-6">
              This feature is not yet available. Please check back later!
            </p>
            <Button
              onClick={handleCloseUnavailableModal}
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

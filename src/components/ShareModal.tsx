import { useState, useRef } from 'react';
import { X, Link as LinkIcon, Mail, MessageCircle, QrCode, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import QRCodeGenerator from './QRCodeGenerator';
import StorySharePreview from './StorySharePreview';
import type { Post } from '@/types/social';

interface ShareModalProps {
  post: Post;
  onClose: () => void;
}

export default function ShareModal({ post, onClose }: ShareModalProps) {
  const { toast } = useToast();
  const [showQRCode, setShowQRCode] = useState(false);
  const [showStoryPreview, setShowStoryPreview] = useState(false);
  
  // Gesture State
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const startY = useRef<number>(0);
  const startTime = useRef<number>(0);
  const isAtTop = useRef<boolean>(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Generate post URL (in production, this would be the actual post URL)
  const postUrl = `${window.location.origin}/post/${post.id}`;

  // Check if Web Share API is supported
  const isNativeShareSupported = typeof navigator.share !== 'undefined';

  const handleNativeShare = async () => {
    if (!isNativeShareSupported) {
      handleCopyLink();
      return;
    }

    try {
      await navigator.share({
        title: `Post by ${post.authorName}`,
        text: post.content || 'Check out this post on Invoque',
        url: postUrl,
      });

      toast({
        title: 'Shared successfully',
        description: 'Post shared via your device',
      });
      onClose();
    } catch (error) {
      // User cancelled or share failed
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
        handleCopyLink();
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    toast({
      title: 'Link copied',
      description: 'Post link copied to clipboard',
    });
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this post by ${post.authorName}`);
    const body = encodeURIComponent(
      `${post.content || 'Check out this post on Invoque'}\n\n${postUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    onClose();
  };

  const handleShareToStory = () => {
    setShowStoryPreview(true);
  };

  const handleShowQRCode = () => {
    setShowQRCode(true);
  };

  // Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
    
    // Check if content is scrolled to top
    if (contentRef.current) {
      isAtTop.current = contentRef.current.scrollTop <= 0;
    } else {
      isAtTop.current = true;
    }
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const delta = currentY - startY.current;

    // Only track downward drag if we started at the top
    if (delta > 0 && isAtTop.current) {
      // Prevent scrolling the content when dragging down to dismiss
      if (e.cancelable) {
        e.preventDefault();
      }
      // Apply resistance so it moves slower than finger
      setDragOffset(delta * 0.5);
    } else {
      // Allow normal scrolling otherwise
      setDragOffset(0);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);

    const currentY = e.changedTouches[0].clientY;
    const deltaY = currentY - startY.current;
    const deltaTime = Date.now() - startTime.current;
    const velocity = Math.abs(deltaY / deltaTime); // px/ms

    // Dismiss if:
    // 1. Dragged far enough (> 100px visual offset)
    // 2. Fast swipe (> 0.5px/ms) AND moved at least a bit (> 50px visual offset)
    if (dragOffset > 100 || (dragOffset > 50 && velocity > 0.5)) {
      setIsDismissing(true);
      // Wait for animation to complete before unmounting
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      setDragOffset(0);
    }
  };

  if (showQRCode) {
    return (
      <QRCodeGenerator
        url={postUrl}
        postAuthor={post.authorName}
        onClose={() => setShowQRCode(false)}
        onBack={() => setShowQRCode(false)}
      />
    );
  }

  if (showStoryPreview) {
    return (
      <StorySharePreview
        post={post}
        onClose={() => setShowStoryPreview(false)}
        onBack={() => setShowStoryPreview(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-end lg:items-center justify-center">
      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      <div 
        className="bg-background w-full lg:max-w-md rounded-t-2xl lg:rounded-2xl max-h-[80vh] flex flex-col relative z-10 animate-in slide-in-from-bottom duration-300 shadow-xl"
        style={{
          transform: isDismissing ? 'translateY(100%)' : `translateY(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle for visual cue (static) */}
        <div className="w-full flex justify-center pt-3 pb-1 lg:hidden">
          <div className="w-12 h-1.5 bg-tertiary-foreground/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-h3 font-semibold text-foreground">Share</h2>
          <button onClick={onClose} className="text-foreground hover:text-tertiary-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Share Options */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4"
        >
          {/* Native Share (if supported) */}
          {isNativeShareSupported && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center gap-4 p-4 hover:bg-tertiary rounded-lg transition-colors"
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-body font-medium text-foreground">Share via...</p>
                <p className="text-body-sm text-tertiary-foreground">
                  Share to your recent apps
                </p>
              </div>
            </button>
          )}

          {/* Share to Story */}
          <button
            onClick={handleShareToStory}
            className="w-full flex items-center gap-4 p-4 hover:bg-tertiary rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-body font-medium text-foreground">Share to Story</p>
              <p className="text-body-sm text-tertiary-foreground">
                Add this post to your story
              </p>
            </div>
          </button>

          {/* QR Code */}
          <button
            onClick={handleShowQRCode}
            className="w-full flex items-center gap-4 p-4 hover:bg-tertiary rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <QrCode className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-body font-medium text-foreground">QR Code</p>
              <p className="text-body-sm text-tertiary-foreground">
                Share via QR code
              </p>
            </div>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-4 p-4 hover:bg-tertiary rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-body font-medium text-foreground">Copy Link</p>
              <p className="text-body-sm text-tertiary-foreground">
                Copy post link to clipboard
              </p>
            </div>
          </button>

          {/* Email */}
          <button
            onClick={handleEmailShare}
            className="w-full flex items-center gap-4 p-4 hover:bg-tertiary rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-body font-medium text-foreground">Email</p>
              <p className="text-body-sm text-tertiary-foreground">
                Share via email
              </p>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <div 
          className="p-4 border-t border-border"
          style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
        >
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-border hover:bg-tertiary"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

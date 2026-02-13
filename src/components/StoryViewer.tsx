import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStories } from '@/contexts/StoriesContext';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { resolveMedia, handleImageError, handleAvatarError } from '@/lib/utils';
import type { StoryItem } from '@/types/stories';

import { useSignedUrl } from '@/hooks/useSignedUrl';

// Helper component to render story media
const StoryMedia = ({ story, active }: { story: StoryItem; active: boolean }) => {
  const media = resolveMedia(story);
  const { signedUrl } = useSignedUrl(media?.url);

  if (!media || !signedUrl) return null;

  if (media.type === 'video') {
    return (
      <video
        src={signedUrl}
        className="w-full h-full object-contain"
        controls={false}
        muted
        playsInline
        autoPlay={active}
        loop
      />
    );
  }
  return (
    <img
      src={signedUrl}
      alt="Story"
      className="w-full h-full object-contain"
      onError={handleImageError}
    />
  );
};

export default function StoryViewer() {
  const navigate = useNavigate();
  const { viewerState, closeViewer, stories, hasActiveStory } = useStories();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const lastFrameTimeRef = useRef<number>(0);

  // Swipe Animation State
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);
  const minSwipeDistance = 50;
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 375;

  useEffect(() => {
    if (viewerState.isOpen && viewerState.initialUserId) {
      setCurrentUserId(viewerState.initialUserId);
      setCurrentIndex(0);
      setProgress(0);
      startTimeRef.current = null;
      setDragOffset(0);
      setIsAnimating(false);
    } else if (!viewerState.isOpen) {
      setCurrentUserId(null);
      setCurrentIndex(0);
      setProgress(0);
      setDragOffset(0);
    }
  }, [viewerState.isOpen, viewerState.initialUserId]);

  const userStory = currentUserId ? stories[currentUserId] : null;
  const storiesList = userStory?.items || [];
  const currentStory = storiesList[currentIndex];

  const advanceToNext = useCallback(() => {
    if (!currentUserId || !userStory) return;

    if (currentIndex < storiesList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      startTimeRef.current = null;
    } else {
      const userIds = Object.keys(stories).filter(id => hasActiveStory(id));
      const currentUserIdx = userIds.indexOf(currentUserId);

      if (currentUserIdx !== -1 && currentUserIdx < userIds.length - 1) {
        const nextUserId = userIds[currentUserIdx + 1];
        setCurrentUserId(nextUserId);
        setCurrentIndex(0);
        setProgress(0);
        startTimeRef.current = null;
      } else {
        closeViewer();
      }
    }
  }, [currentUserId, userStory, storiesList.length, currentIndex, stories, hasActiveStory, closeViewer]);

  const advanceToPrevious = useCallback(() => {
    if (!currentUserId) return;

    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      startTimeRef.current = null;
    } else {
      const userIds = Object.keys(stories).filter(id => hasActiveStory(id));
      const currentUserIdx = userIds.indexOf(currentUserId);

      if (currentUserIdx > 0) {
        const prevUserId = userIds[currentUserIdx - 1];
        setCurrentUserId(prevUserId);
        setCurrentIndex(0);
        setProgress(0);
        startTimeRef.current = null;
      } else {
        setCurrentIndex(0);
        setProgress(0);
        startTimeRef.current = null;
      }
    }
  }, [currentUserId, currentIndex, stories, hasActiveStory]);

  // Swipe-specific navigation: Jump to Next User
  const advanceToNextUser = useCallback(() => {
    const userIds = Object.keys(stories).filter(id => hasActiveStory(id));
    const currentUserIdx = userIds.indexOf(currentUserId || '');

    if (currentUserIdx !== -1 && currentUserIdx < userIds.length - 1) {
      const nextUserId = userIds[currentUserIdx + 1];
      setCurrentUserId(nextUserId);
      setCurrentIndex(0);
      setProgress(0);
      startTimeRef.current = null;
    }
  }, [currentUserId, stories, hasActiveStory]);

  // Swipe-specific navigation: Jump to Previous User
  const advanceToPreviousUser = useCallback(() => {
    const userIds = Object.keys(stories).filter(id => hasActiveStory(id));
    const currentUserIdx = userIds.indexOf(currentUserId || '');

    if (currentUserIdx > 0) {
      const prevUserId = userIds[currentUserIdx - 1];
      setCurrentUserId(prevUserId);
      setCurrentIndex(0);
      setProgress(0);
      startTimeRef.current = null;
    }
  }, [currentUserId, stories, hasActiveStory]);

  // Helper to get adjacent stories for preview (User-based for swipes)
  const getStoryAtOffset = useCallback((offset: number) => {
    if (!currentUserId || !userStory) return null;
    
    if (offset === 0) return currentStory;

    const userIds = Object.keys(stories).filter(id => hasActiveStory(id));
    const currentUserIdx = userIds.indexOf(currentUserId);

    if (offset === 1) {
      // Next User's first story
      if (currentUserIdx !== -1 && currentUserIdx < userIds.length - 1) {
        const nextUserId = userIds[currentUserIdx + 1];
        return stories[nextUserId]?.items[0] || null;
      }
    } else if (offset === -1) {
      // Previous User's first story
      if (currentUserIdx > 0) {
        const prevUserId = userIds[currentUserIdx - 1];
        return stories[prevUserId]?.items[0] || null;
      }
    }
    return null;
  }, [currentUserId, userStory, stories, hasActiveStory, currentStory]);

  useEffect(() => {
    if (!viewerState.isOpen || !currentStory) return;

    const duration = (currentStory.duration || 5) * 1000;

    const animate = (time: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
        lastFrameTimeRef.current = time;
        setProgress(0);
        progressRef.current = 0;
      }

      const deltaTime = time - lastFrameTimeRef.current;
      lastFrameTimeRef.current = time;

      // Pause timer if:
      // 1. Swiping (isSwiping.current)
      // 2. Tab/App was backgrounded (deltaTime > 500ms)
      if (isSwiping.current || deltaTime > 500) {
        startTimeRef.current += deltaTime;
      }
      
      const elapsed = time - startTimeRef.current;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      progressRef.current = newProgress;

      if (elapsed < duration) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        advanceToNext();
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [viewerState.isOpen, currentStory?.id, advanceToNext]);

  const handleLeftTap = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSwiping.current) return;
    advanceToPrevious();
  }, [advanceToPrevious]);

  const handleRightTap = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSwiping.current) return;
    advanceToNext();
  }, [advanceToNext]);

  // Swipe Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    isSwiping.current = false;
    setIsAnimating(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // If moved significantly, mark as swiping to prevent tap
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        isSwiping.current = true;
    }

    // Only track horizontal swipes for animation
    if (isSwiping.current && Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault(); // Prevent scrolling
      setDragOffset(deltaX);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;

    // Reset refs
    touchStartX.current = null;
    touchStartY.current = null;

    if (isSwiping.current) {
      setIsAnimating(true);
      
      const userIds = Object.keys(stories).filter(id => hasActiveStory(id));
      const currentUserIdx = userIds.indexOf(currentUserId || '');
      const hasNextUser = currentUserIdx !== -1 && currentUserIdx < userIds.length - 1;
      const hasPrevUser = currentUserIdx > 0;

      if (Math.abs(deltaX) > minSwipeDistance) {
        // Swipe Left (Next User)
        if (deltaX < 0 && hasNextUser) {
          const targetOffset = -windowWidth;
          setDragOffset(targetOffset);
          
          setTimeout(() => {
            advanceToNextUser();
            setIsAnimating(false);
            setDragOffset(0);
            isSwiping.current = false;
          }, 300);
        } 
        // Swipe Right (Prev User)
        else if (deltaX > 0 && hasPrevUser) {
          const targetOffset = windowWidth;
          setDragOffset(targetOffset);
          
          setTimeout(() => {
            advanceToPreviousUser();
            setIsAnimating(false);
            setDragOffset(0);
            isSwiping.current = false;
          }, 300);
        } else {
          // Cannot navigate (no next/prev user), snap back gracefully
          setDragOffset(0);
          setTimeout(() => {
            setIsAnimating(false);
            isSwiping.current = false;
          }, 300);
        }
      } else {
        // Cancel the swipe (not far enough)
        setDragOffset(0);
        setTimeout(() => {
          setIsAnimating(false);
          isSwiping.current = false;
        }, 300);
      }
    }
  };

  const handleProfileClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUserId) {
      closeViewer();
      navigate(`/profile/${currentUserId}`);
    }
  }, [currentUserId, closeViewer, navigate]);

  if (!viewerState.isOpen || !userStory || !currentStory) {
    return null;
  }

  const nextStory = getStoryAtOffset(1);
  const prevStory = getStoryAtOffset(-1);

  // Calculate transforms
  const progressRatio = Math.abs(dragOffset) / windowWidth;
  const scale = 1 - progressRatio * 0.1; // Scale down to 0.9
  const rotateY = (dragOffset / windowWidth) * -15; // Rotate up to 15deg
  
  const currentStyle = {
    transform: `translateX(${dragOffset}px) scale(${scale}) rotateY(${rotateY}deg)`,
    transition: isAnimating ? 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
    transformOrigin: 'center center',
    zIndex: 10,
  };

  const nextStyle = {
    transform: `translateX(${windowWidth + dragOffset}px) scale(${0.9 + progressRatio * 0.1})`,
    transition: isAnimating ? 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
    zIndex: 11,
  };

  const prevStyle = {
    transform: `translateX(${-windowWidth + dragOffset}px) scale(${0.9 + progressRatio * 0.1})`,
    transition: isAnimating ? 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
    zIndex: 11,
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return '1d';
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center touch-none"
      style={{ perspective: '1000px' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute top-0 left-0 right-0 z-50 p-2 pt-4 flex gap-1 safe-top pointer-events-none">
         {storiesList.map((_, idx) => (
           <div key={idx} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
             <div 
               className="h-full bg-white transition-all duration-75 ease-linear"
               style={{ 
                 width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
               }}
             />
           </div>
         ))}
      </div>

      <div 
        className="absolute top-8 left-4 z-50 flex items-center gap-3 pointer-events-auto cursor-pointer"
        onClick={handleProfileClick}
      >
        <img 
          src={userStory.avatar} 
          alt={userStory.username}
          className="w-8 h-8 rounded-full border border-white/20 object-cover"
          onError={handleAvatarError}
        />
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm drop-shadow-md">
            {userStory.username}
          </span>
          <span className="text-white/60 text-xs drop-shadow-md">
            {getTimeAgo(currentStory.createdAt)}
          </span>
        </div>
      </div>

      <div className="absolute top-8 right-4 z-50 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeViewer();
          }}
          className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
        >
          <X className="w-6 h-6 drop-shadow-md" />
        </button>
      </div>

      <div className="absolute inset-0 flex z-40">
        <div 
          className="w-1/2 h-full cursor-pointer" 
          onClick={handleLeftTap}
        />
        <div 
          className="w-1/2 h-full cursor-pointer" 
          onClick={handleRightTap}
        />
      </div>

      {/* Previous Story Preview */}
      {prevStory && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black" style={prevStyle}>
          <div className="w-full h-full opacity-50">
            <StoryMedia story={prevStory} active={false} />
          </div>
        </div>
      )}

      {/* Current Story */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black" style={currentStyle}>
        <StoryMedia story={currentStory} active={!isSwiping.current} />
      </div>

      {/* Next Story Preview */}
      {nextStory && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black" style={nextStyle}>
          <div className="w-full h-full opacity-50">
            <StoryMedia story={nextStory} active={false} />
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

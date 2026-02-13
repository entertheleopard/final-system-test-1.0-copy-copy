import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserStory, StoryItem, StoryDuration } from '@/types/stories';

type StoriesContextType = {
  stories: Record<string, UserStory>;
  addStory: (file: File, type: 'image' | 'video', durationHours: StoryDuration, segment?: { start: number; end: number }) => Promise<void>;
  deleteStory: (storyId: string) => void;
  markAsViewed: (userId: string, storyId: string) => void;
  getStoriesForUser: (userId: string) => UserStory | undefined;
  hasActiveStory: (userId: string) => boolean;
  viewerState: { isOpen: boolean; initialUserId: string | null };
  openViewer: (userId: string) => void;
  closeViewer: () => void;
};

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

// Mock initial stories
const INITIAL_STORIES: Record<string, UserStory> = {};

export function StoriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [stories, setStories] = useState<Record<string, UserStory>>(INITIAL_STORIES);

  // Clean up expired stories periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setStories(prev => {
        const next = { ...prev };
        let changed = false;
        
        Object.keys(next).forEach(userId => {
          const activeItems = next[userId].items.filter(item => item.expiresAt > now);
          if (activeItems.length !== next[userId].items.length) {
            if (activeItems.length === 0) {
              delete next[userId];
            } else {
              next[userId] = { ...next[userId], items: activeItems };
            }
            changed = true;
          }
        });
        
        return changed ? next : prev;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const addStory = async (file: File, type: 'image' | 'video', durationHours: StoryDuration, segment?: { start: number; end: number }) => {
    if (!user) return;

    const url = URL.createObjectURL(file);
    
    // Determine duration: use segment length if available, otherwise default
    let duration = type === 'video' ? 15 : 5;
    if (segment) {
      duration = segment.end - segment.start;
    }

    const newItem: StoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      url,
      duration,
      segment,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + durationHours * 60 * 60 * 1000),
      isViewed: false,
    };

    setStories(prev => {
      const userStories = prev[user.id] || {
        userId: user.id,
        username: user.name || 'You',
        avatar: user.profilePictureUrl || 'https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_5.png',
        items: []
      };

      return {
        ...prev,
        [user.id]: {
          ...userStories,
          items: [...userStories.items, newItem]
        }
      };
    });
  };

  const deleteStory = (storyId: string) => {
    if (!user) return;
    setStories(prev => {
      const userStories = prev[user.id];
      if (!userStories) return prev;

      const updatedItems = userStories.items.filter(item => item.id !== storyId);
      
      if (updatedItems.length === 0) {
        const { [user.id]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [user.id]: {
          ...userStories,
          items: updatedItems
        }
      };
    });
  };

  const markAsViewed = (userId: string, storyId: string) => {
    setStories(prev => {
      if (!prev[userId]) return prev;

      const items = prev[userId].items.map(item => 
        item.id === storyId ? { ...item, isViewed: true } : item
      );

      return {
        ...prev,
        [userId]: {
          ...prev[userId],
          items
        }
      };
    });
  };

  const getStoriesForUser = (userId: string) => {
    return stories[userId];
  };

  const hasActiveStory = (userId: string) => {
    const userStory = stories[userId];
    if (!userStory) return false;
    return userStory.items.some(item => item.expiresAt > new Date());
  };

  const [viewerState, setViewerState] = useState<{ isOpen: boolean; initialUserId: string | null }>({
    isOpen: false,
    initialUserId: null,
  });

  const openViewer = (userId: string) => {
    setViewerState({ isOpen: true, initialUserId: userId });
  };

  const closeViewer = () => {
    setViewerState({ isOpen: false, initialUserId: null });
  };

  return (
    <StoriesContext.Provider value={{ 
      stories, 
      addStory, 
      deleteStory, 
      markAsViewed, 
      getStoriesForUser, 
      hasActiveStory,
      viewerState,
      openViewer,
      closeViewer
    }}>
      {children}
    </StoriesContext.Provider>
  );
}

export function useStories() {
  const context = useContext(StoriesContext);
  if (context === undefined) {
    throw new Error('useStories must be used within a StoriesProvider');
  }
  return context;
}

export type StoryItem = {
  id: string;
  type: 'image' | 'video';
  url: string;
  duration: number; // in seconds
  segment?: {
    start: number;
    end: number;
  };
  createdAt: Date;
  expiresAt: Date;
  isViewed: boolean;
};

export type UserStory = {
  userId: string;
  username: string;
  avatar: string;
  items: StoryItem[];
};

export type StoryDuration = 24 | 48;

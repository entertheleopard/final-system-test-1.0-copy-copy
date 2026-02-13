import { useNavigate } from 'react-router-dom';
import { useStories } from '@/contexts/StoriesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';
import { AvatarImage } from '@/components/ui/AvatarImage';

interface StoryCircleProps {
  userId?: string;
  isAddStory?: boolean;
  onClick?: () => void;
}

export default function StoryCircle({ userId, isAddStory, onClick }: StoryCircleProps) {
  const navigate = useNavigate();
  const { getStoriesForUser, hasActiveStory, openViewer } = useStories();
  const { user } = useAuth();

  // Handle "Add Story" button explicitly
  if (isAddStory) {
    const userStory = user ? getStoriesForUser(user.id) : undefined;
    const hasStory = user ? hasActiveStory(user.id) : false;

    return (
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <button
          onClick={onClick}
          className="relative w-16 h-16"
        >
          <div className={`w-full h-full rounded-full p-0.5 ${
            hasStory 
              ? 'bg-primary' 
              : 'bg-transparent border border-border'
          }`}>
            <AvatarImage
              src={user?.profilePictureUrl}
              alt="Your Story"
              className="w-full h-full rounded-full border-2 border-background"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background z-50">
            <Plus className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        </button>
        <span className="text-caption text-foreground">Your Story</span>
      </div>
    );
  }

  if (!userId) return null;

  const userStory = getStoriesForUser(userId);
  if (!userStory) return null;

  const hasStory = hasActiveStory(userId);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick();
    } else if (userId && hasStory && userStory) {
      openViewer(userId);
    }
  };

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <button
        onClick={handleAvatarClick}
        className="w-16 h-16 rounded-full p-0.5 bg-primary"
      >
        <AvatarImage
          src={userStory.avatar}
          alt={userStory.username}
          className="w-full h-full rounded-full border-2 border-background"
        />
      </button>
      <button
        onClick={handleUsernameClick}
        className="text-caption text-foreground truncate max-w-[64px] hover:text-tertiary-foreground transition-colors"
      >
        {userStory.username}
      </button>
    </div>
  );
}

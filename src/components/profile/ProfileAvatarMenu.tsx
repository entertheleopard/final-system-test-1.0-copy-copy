import { useRef, useEffect } from 'react';
import { X, Plus, Image as ImageIcon, PlayCircle, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileAvatarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  hasActiveStory: boolean;
  onViewStory: () => void;
  onCreateStory: () => void;
  onViewProfilePicture: () => void;
  onChangeProfilePicture: () => void;
}

export default function ProfileAvatarMenu({
  isOpen,
  onClose,
  hasActiveStory,
  onViewStory,
  onCreateStory,
  onViewProfilePicture,
  onChangeProfilePicture,
}: ProfileAvatarMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={menuRef}
        className="w-full max-w-sm bg-background rounded-t-2xl sm:rounded-2xl p-4 pb-8 sm:pb-4 shadow-xl animate-in slide-in-from-bottom-10 duration-300 safe-bottom"
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-body font-semibold text-foreground">Profile Photo</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-tertiary rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-tertiary-foreground" />
          </button>
        </div>

        <div className="space-y-2">
          {hasActiveStory && (
            <button
              onClick={() => {
                onViewStory();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-tertiary rounded-xl transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-body-sm font-medium text-foreground">View Story</p>
                <p className="text-caption text-tertiary-foreground">Watch your active story</p>
              </div>
            </button>
          )}

          <button
            onClick={() => {
              onCreateStory();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 hover:bg-tertiary rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-tertiary border border-border flex items-center justify-center text-foreground">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-body-sm font-medium text-foreground">Add to Story</p>
              <p className="text-caption text-tertiary-foreground">Share a photo or video</p>
            </div>
          </button>

          <button
            onClick={() => {
              onViewProfilePicture();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 hover:bg-tertiary rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-tertiary border border-border flex items-center justify-center text-foreground">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-body-sm font-medium text-foreground">View Profile Picture</p>
              <p className="text-caption text-tertiary-foreground">See current and past photos</p>
            </div>
          </button>

          <button
            onClick={() => {
              onChangeProfilePicture();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 hover:bg-tertiary rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-tertiary border border-border flex items-center justify-center text-foreground">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <p className="text-body-sm font-medium text-foreground">Change Profile Picture</p>
              <p className="text-caption text-tertiary-foreground">Upload a new photo</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

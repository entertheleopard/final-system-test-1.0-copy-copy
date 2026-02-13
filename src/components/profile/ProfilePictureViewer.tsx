import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { handleAvatarError } from '@/lib/utils';

interface ProfilePictureViewerProps {
  currentAvatar: string;
  pastAvatars?: string[];
  onClose: () => void;
}

export default function ProfilePictureViewer({ 
  currentAvatar, 
  pastAvatars = [], 
  onClose 
}: ProfilePictureViewerProps) {
  // Combine current and past avatars, ensuring current is first
  const allAvatars = [currentAvatar, ...pastAvatars];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < allAvatars.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 safe-top">
        <div className="text-white/80 text-body-sm font-medium">
          {currentIndex + 1} / {allAvatars.length}
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative w-full h-full">
        
        {/* Navigation Buttons (Desktop) */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 p-3 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors hidden sm:flex z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {currentIndex < allAvatars.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 p-3 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors hidden sm:flex z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Image Container */}
        <div 
          className="w-full h-full flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image area
        >
          <img
            src={allAvatars[currentIndex]}
            alt={`Profile picture ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain shadow-2xl"
            onError={handleAvatarError}
          />
        </div>

        {/* Touch Navigation Zones (Mobile) */}
        <div className="absolute inset-0 flex sm:hidden">
          <div 
            className="w-1/3 h-full" 
            onClick={(e) => {
              e.stopPropagation();
              if (currentIndex > 0) handlePrev(e);
            }} 
          />
          <div className="w-1/3 h-full" onClick={onClose} />
          <div 
            className="w-1/3 h-full" 
            onClick={(e) => {
              e.stopPropagation();
              if (currentIndex < allAvatars.length - 1) handleNext(e);
            }} 
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent safe-bottom pointer-events-none">
        <p className="text-white text-center font-medium">
          {currentIndex === 0 ? 'Current Profile Picture' : `Past Profile Picture • ${new Date(Date.now() - currentIndex * 86400000 * 30).toLocaleDateString()}`}
        </p>
      </div>
    </div>
  );
}

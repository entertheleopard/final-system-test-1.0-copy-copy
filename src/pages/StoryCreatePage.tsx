import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, Send, Scissors } from 'lucide-react';
import { useStories } from '@/contexts/StoriesContext';
import MediaSelector from '@/components/upload/MediaSelector';
import VideoTrimmer from '@/components/upload/VideoTrimmer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { handleImageError } from '@/lib/utils';
import type { MediaFile, StoryDuration } from '@/types/stories';

type Step = 'select' | 'trim' | 'preview';

export default function StoryCreatePage() {
  const navigate = useNavigate();
  const { addStory } = useStories();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('select');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [duration, setDuration] = useState<StoryDuration>(24);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Trimming state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  const handleMediaSelected = (files: MediaFile[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      if (file.type === 'video') {
        // Initialize trim range to full duration
        setTrimStart(0);
        setTrimEnd(file.duration || 15); // Default to 15 if duration unknown
        setStep('trim');
      } else {
        setStep('preview');
      }
    }
  };

  const handleTrimChange = (start: number, end: number) => {
    setTrimStart(start);
    setTrimEnd(end);
  };

  const handleTrimConfirm = () => {
    setStep('preview');
  };

  const handlePublish = async () => {
    if (!selectedFile) return;

    setIsPublishing(true);
    try {
      if (selectedFile.type === 'video') {
        // Logic to split video into 15s segments
        const SEGMENT_DURATION = 15;
        const totalDuration = trimEnd - trimStart;
        const numSegments = Math.ceil(totalDuration / SEGMENT_DURATION);

        for (let i = 0; i < numSegments; i++) {
          const segmentStart = trimStart + (i * SEGMENT_DURATION);
          const segmentEnd = Math.min(segmentStart + SEGMENT_DURATION, trimEnd);
          
          await addStory(selectedFile.file, 'video', duration, {
            start: segmentStart,
            end: segmentEnd
          });
        }
        
        toast({
          title: 'Story added',
          description: numSegments > 1 
            ? `Video split into ${numSegments} stories.` 
            : `Your story will be visible for ${duration} hours.`,
        });
      } else {
        // Image story
        await addStory(selectedFile.file, 'image', duration);
        toast({
          title: 'Story added',
          description: `Your story will be visible for ${duration} hours.`,
        });
      }
      
      navigate('/ladder');
    } catch (error) {
      console.error('Failed to add story:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (step === 'select') {
    return (
      <div className="h-screen bg-black">
        <MediaSelector 
          onMediaSelected={handleMediaSelected} 
          onCancel={() => navigate(-1)} 
          mode="story"
        />
      </div>
    );
  }

  if (step === 'trim' && selectedFile?.type === 'video') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 safe-top">
          <button 
            onClick={() => setStep('select')}
            className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <h3 className="text-white font-semibold">Trim Video</h3>
          <Button 
            onClick={handleTrimConfirm}
            className="bg-white text-black hover:bg-white/90 rounded-full px-6"
          >
            Next
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <video 
            src={selectedFile.url} 
            className="max-w-full max-h-[60vh] object-contain"
            autoPlay 
            loop 
            muted 
            playsInline 
            // Simple preview loop of selected range would require more complex logic
            // For MVP, just playing the video is acceptable
          />
        </div>

        <div className="bg-background border-t border-border p-4 safe-bottom">
          <VideoTrimmer 
            duration={selectedFile.duration || 60} 
            trim={{ start: trimStart, end: trimEnd }}
            onTrimChange={handleTrimChange}
            onClose={() => {}} // Hide close button in trimmer
          />
          <p className="text-center text-tertiary-foreground text-xs mt-4">
            Videos longer than 15s will be automatically split into multiple stories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 safe-top">
        <button 
          onClick={() => setStep('select')}
          className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Duration Selector */}
        <div className="flex bg-black/50 rounded-full p-1">
          <button
            onClick={() => setDuration(24)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              duration === 24 ? 'bg-white text-black' : 'text-white hover:bg-white/20'
            }`}
          >
            24h
          </button>
          <button
            onClick={() => setDuration(48)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              duration === 48 ? 'bg-white text-black' : 'text-white hover:bg-white/20'
            }`}
          >
            48h
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 relative flex items-center justify-center">
        {selectedFile?.type === 'video' ? (
          <video 
            src={selectedFile.url} 
            className="max-w-full max-h-full object-contain"
            autoPlay 
            loop 
            muted 
            playsInline 
          />
        ) : (
          <img 
            src={selectedFile?.url} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain" 
            onError={handleImageError}
          />
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 safe-bottom">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Clock className="w-4 h-4" />
            <span>Expires in {duration} hours</span>
          </div>
          
          <Button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-white text-black hover:bg-white/90 rounded-full px-6 h-12 font-semibold flex items-center gap-2"
          >
            {isPublishing ? 'Posting...' : (
              <>
                <span>Your Story</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

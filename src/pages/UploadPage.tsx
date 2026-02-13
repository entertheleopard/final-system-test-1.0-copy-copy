import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstagramLayout from '@/components/InstagramLayout';
import MediaSelector from '@/components/upload/MediaSelector';
import PhotoEditor from '@/components/upload/PhotoEditor';
import VideoEditor from '@/components/upload/VideoEditor';
import CaptionEditor from '@/components/upload/CaptionEditor';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '../../supabase';
import { cn } from '@/lib/utils';
import type { MediaFile, EditedMedia } from '@/types/upload';

type UploadStep = 'select' | 'edit' | 'caption';

export default function UploadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Auth
  const { user, isPending: isAuthPending } = useAuth();

  const [currentStep, setCurrentStep] = useState<UploadStep>('select');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [editedMedia, setEditedMedia] = useState<EditedMedia[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleMediaSelected = (files: MediaFile[]) => {
    setSelectedMedia(files);
    setCurrentStep('edit');
  };

  const handleEditComplete = (edited: EditedMedia[]) => {
    setEditedMedia(edited);
    setCurrentStep('caption');
  };

  const handlePublish = async (caption: string, location?: string, tags?: string[]) => {
    if (!user || editedMedia.length === 0) return;

    setIsPublishing(true);
    try {
      const mediaItem = editedMedia[0];
      
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: caption,
        media_url: mediaItem.finalUrl,
        media_type: mediaItem.type,
        likes: 0,
        comments: 0,
        reposts: 0,
        saves: 0
      });

      if (error) throw error;

      toast({
        title: 'Post published',
        description: 'Your post has been shared successfully',
      });
      navigate('/ladder');
    } catch (error: any) {
      console.error('Failed to publish post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'caption') {
      setCurrentStep('edit');
    } else if (currentStep === 'edit') {
      setCurrentStep('select');
      setSelectedMedia([]);
    } else {
      navigate(-1);
    }
  };

  if (isAuthPending) {
    return (
      <InstagramLayout hideBottomNav>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </InstagramLayout>
    );
  }

  if (!user) return null;

  return (
    <InstagramLayout hideBottomNav>
      <div 
        className={cn(
          "w-full flex flex-col bg-background min-h-[100dvh]",
          // Ensure safe area padding at the bottom
          "pb-safe-bottom"
        )}
      >
        {currentStep === 'select' && (
          <div className="flex-1 flex flex-col h-[100dvh]">
            <MediaSelector onMediaSelected={handleMediaSelected} onCancel={() => navigate(-1)} />
          </div>
        )}

        {currentStep === 'edit' && selectedMedia.length > 0 && (
          <div className="flex-1 flex flex-col h-[100dvh]">
            {selectedMedia[0].type === 'image' ? (
              <PhotoEditor
                media={selectedMedia}
                onComplete={handleEditComplete}
                onBack={handleBack}
              />
            ) : (
              <VideoEditor
                media={selectedMedia}
                onComplete={handleEditComplete}
                onBack={handleBack}
              />
            )}
          </div>
        )}

        {currentStep === 'caption' && editedMedia.length > 0 && (
          <div className="flex-1 flex flex-col">
            <CaptionEditor
              media={editedMedia}
              onPublish={handlePublish}
              onBack={handleBack}
              isPublishing={isPublishing}
            />
          </div>
        )}
      </div>
    </InstagramLayout>
  );
}

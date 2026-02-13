import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, Video, Camera, X, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CameraCapture from './CameraCapture';
import { handleImageError } from '@/lib/utils';
import type { MediaFile } from '@/types/upload';

interface MediaSelectorProps {
  onMediaSelected: (files: MediaFile[]) => void;
  onCancel: () => void;
  mode?: 'post' | 'story';
}

export default function MediaSelector({ onMediaSelected, onCancel, mode = 'post' }: MediaSelectorProps) {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const mediaFiles: MediaFile[] = [];

    for (const file of files) {
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      const url = URL.createObjectURL(file);

      const mediaFile: MediaFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type,
        url,
      };

      // Generate thumbnail for videos
      if (type === 'video') {
        const video = document.createElement('video');
        video.src = url;
        video.currentTime = 0.1;
        
        await new Promise((resolve) => {
          video.onloadeddata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            mediaFile.thumbnail = canvas.toDataURL();
            mediaFile.duration = video.duration;
            resolve(null);
          };
        });
      }

      mediaFiles.push(mediaFile);
    }

    setSelectedFiles(mediaFiles);
  };

  const handleNext = () => {
    if (selectedFiles.length > 0) {
      onMediaSelected(selectedFiles);
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles(selectedFiles.filter(f => f.id !== id));
  };

  const handleCameraCapture = (file: File, type: 'image' | 'video') => {
    const url = URL.createObjectURL(file);
    const mediaFile: MediaFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      type,
      url,
    };

    // For video, we might want to generate a thumbnail, but for now we'll skip it or do it async
    // The existing logic in handleFileSelect does it, we could extract it if needed.
    // For simplicity in this flow, we'll just add it.
    
    if (type === 'video') {
      const video = document.createElement('video');
      video.src = url;
      video.currentTime = 0.1;
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        mediaFile.thumbnail = canvas.toDataURL();
        mediaFile.duration = video.duration;
        
        // Update state with thumbnail
        setSelectedFiles(prev => prev.map(f => f.id === mediaFile.id ? mediaFile : f));
      };
    }

    setSelectedFiles(prev => [...prev, mediaFile]);
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <CameraCapture 
        onCapture={handleCameraCapture} 
        onClose={() => setShowCamera(false)} 
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={onCancel} className="text-foreground hover:text-tertiary-foreground">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-h3 font-semibold text-foreground">
          {mode === 'story' ? 'Add to Story' : 'New Post'}
        </h1>
        <Button
          onClick={handleNext}
          disabled={selectedFiles.length === 0}
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
        >
          Next
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {selectedFiles.length === 0 ? (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
              <Upload className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-h2 font-semibold text-foreground mb-2">
                Select photos and videos
              </h2>
              <p className="text-body text-tertiary-foreground">
                Choose from your gallery or take new ones
              </p>
            </div>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                Select from Gallery
              </Button>

              <Button
                onClick={() => setShowCamera(true)}
                variant="outline"
                className="w-full border-border hover:bg-tertiary"
              >
                <Camera className="w-5 h-5 mr-2" />
                Take Photo/Video
              </Button>

              {mode === 'post' && (
                <Button
                  onClick={() => navigate('/live', { state: { fromCreatePost: true } })}
                  variant="outline"
                  className="w-full border-border hover:bg-tertiary text-error hover:text-error"
                >
                  <Radio className="w-5 h-5 mr-2" />
                  Go Live
                </Button>
              )}
            </div>

            <div className="text-caption text-tertiary-foreground">
              <p>Supported formats:</p>
              <p>Images: JPG, PNG, WEBP</p>
              <p>Videos: MP4, MOV</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-body text-foreground">
                {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-border hover:bg-tertiary"
              >
                Add More
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selectedFiles.map((file) => (
                <div key={file.id} className="relative aspect-square bg-tertiary rounded-lg overflow-hidden group">
                  <img
                    src={file.type === 'image' ? file.url : file.thumbnail}
                    alt="Selected media"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                  {file.type === 'video' && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-caption flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {Math.floor(file.duration || 0)}s
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="absolute top-2 left-2 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

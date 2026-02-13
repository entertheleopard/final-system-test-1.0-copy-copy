import { useState } from 'react';
import { ArrowLeft, MapPin, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleImageError } from '@/lib/utils';
import type { EditedMedia } from '@/types/upload';

interface CaptionEditorProps {
  media: EditedMedia[];
  onPublish: (caption: string, location?: string, tags?: string[]) => void;
  onBack: () => void;
  isPublishing?: boolean;
}

export default function CaptionEditor({ media, onPublish, onBack, isPublishing = false }: CaptionEditorProps) {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);

  const handlePublish = () => {
    const tags = caption.match(/#\w+/g)?.map(tag => tag.slice(1)) || [];
    onPublish(caption, location || undefined, tags);
  };

  return (
    <div className="flex flex-col w-full min-h-full">
      {/* Header - Sticky to top */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm flex items-center justify-between p-4 border-b border-border">
        <button onClick={onBack} className="text-foreground hover:text-tertiary-foreground p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-h3 font-semibold text-foreground">New Post</h1>
        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          className="bg-gradient-primary text-primary-foreground hover:opacity-90 disabled:opacity-70"
        >
          {isPublishing ? 'Posting...' : 'Post'}
        </Button>
      </header>

      {/* Content - Natural Scroll */}
      <div className="p-4 space-y-6">
        {/* Media Preview & Caption */}
        <div className="flex gap-4 items-start">
          <div className="w-20 h-20 bg-tertiary rounded-lg overflow-hidden flex-shrink-0 border border-border">
            {media[0].type === 'image' ? (
              <img
                src={media[0].finalUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <video
                src={media[0].finalUrl}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex-1">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full min-h-[80px] py-2 bg-transparent text-foreground placeholder:text-tertiary-foreground focus:outline-none resize-none text-body"
              maxLength={2200}
            />
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Location */}
        <div>
          {!showLocationInput ? (
            <button
              onClick={() => setShowLocationInput(true)}
              className="flex items-center gap-2 text-body text-foreground hover:text-primary transition-colors w-full py-2"
            >
              <MapPin className="w-5 h-5" />
              <span>Add location</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <MapPin className="w-5 h-5 text-primary" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where was this?"
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-tertiary-foreground focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="border-t border-border" />

        {/* Additional Options */}
        <div className="space-y-1">
          <button className="w-full flex items-center justify-between py-3 hover:bg-tertiary/50 rounded-lg transition-colors px-2 -mx-2">
            <span className="text-body text-foreground">Tag people</span>
          </button>

          <button className="w-full flex items-center justify-between py-3 hover:bg-tertiary/50 rounded-lg transition-colors px-2 -mx-2">
            <span className="text-body text-foreground">Add music</span>
          </button>

          <button className="w-full flex items-center justify-between py-3 hover:bg-tertiary/50 rounded-lg transition-colors px-2 -mx-2">
            <span className="text-body text-foreground">Advanced settings</span>
          </button>
        </div>
        
        {/* Character Count */}
        <div className="text-right text-caption text-tertiary-foreground pt-4">
          {caption.length}/2200
        </div>
      </div>
    </div>
  );
}

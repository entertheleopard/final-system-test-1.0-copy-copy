import { useState } from 'react';
import { ArrowLeft, RotateCw, Crop, Sliders, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilterSelector from './FilterSelector';
import AdjustmentPanel from './AdjustmentPanel';
import CropPanel from './CropPanel';
import { handleImageError } from '@/lib/utils';
import type { MediaFile, EditedMedia, PhotoEdits } from '@/types/upload';

interface PhotoEditorProps {
  media: MediaFile[];
  onComplete: (edited: EditedMedia[]) => void;
  onBack: () => void;
}

type EditorMode = 'filter' | 'adjust' | 'crop';

export default function PhotoEditor({ media, onComplete, onBack }: PhotoEditorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<EditorMode>('filter');
  const [edits, setEdits] = useState<Record<string, PhotoEdits>>(() => {
    const initial: Record<string, PhotoEdits> = {};
    media.forEach(m => {
      initial[m.id] = {
        rotation: 0,
        zoom: 1,
        adjustments: {
          brightness: 0,
          contrast: 0,
          saturation: 0,
          warmth: 0,
          highlights: 0,
          shadows: 0,
          sharpness: 0,
        },
      };
    });
    return initial;
  });

  const currentMedia = media[currentIndex];
  const currentEdits = edits[currentMedia.id];

  const updateEdits = (updates: Partial<PhotoEdits>) => {
    setEdits({
      ...edits,
      [currentMedia.id]: {
        ...currentEdits,
        ...updates,
      },
    });
  };

  const handleRotate = () => {
    updateEdits({ rotation: (currentEdits.rotation + 90) % 360 });
  };

  const handleNext = () => {
    const editedMedia: EditedMedia[] = media.map(m => ({
      id: m.id,
      originalFile: m,
      type: 'image',
      edits: edits[m.id],
      finalUrl: m.url,
    }));
    onComplete(editedMedia);
  };

  const getImageStyle = () => {
    const style: React.CSSProperties = {
      transform: `rotate(${currentEdits.rotation}deg) scale(${currentEdits.zoom})`,
      transition: 'transform 0.2s ease',
    };

    if (currentEdits.filter) {
      style.filter = currentEdits.filter;
    }

    const adj = currentEdits.adjustments;
    const filters = [
      `brightness(${1 + adj.brightness / 100})`,
      `contrast(${1 + adj.contrast / 100})`,
      `saturate(${1 + adj.saturation / 100})`,
      `hue-rotate(${adj.warmth}deg)`,
    ].join(' ');

    style.filter = currentEdits.filter 
      ? `${currentEdits.filter} ${filters}`
      : filters;

    return style;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={onBack} className="text-foreground hover:text-tertiary-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-h3 font-semibold text-foreground">Edit</h1>
        <Button
          onClick={handleNext}
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
        >
          Next
        </Button>
      </header>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center bg-black p-4 overflow-hidden">
        <img
          src={currentMedia.url}
          alt="Preview"
          style={getImageStyle()}
          className="max-w-full max-h-full object-contain"
          onError={handleImageError}
        />
      </div>

      {/* Carousel indicator */}
      {media.length > 1 && (
        <div className="flex justify-center gap-2 py-2 bg-background">
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      )}

      {/* Editor Tools */}
      <div className="border-t border-border bg-background">
        {/* Mode Selector */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setMode('filter')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${
              mode === 'filter'
                ? 'text-primary border-b-2 border-primary'
                : 'text-tertiary-foreground'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-body-sm font-medium">Filters</span>
          </button>
          <button
            onClick={() => setMode('adjust')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${
              mode === 'adjust'
                ? 'text-primary border-b-2 border-primary'
                : 'text-tertiary-foreground'
            }`}
          >
            <Sliders className="w-5 h-5" />
            <span className="text-body-sm font-medium">Adjust</span>
          </button>
          <button
            onClick={() => setMode('crop')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${
              mode === 'crop'
                ? 'text-primary border-b-2 border-primary'
                : 'text-tertiary-foreground'
            }`}
          >
            <Crop className="w-5 h-5" />
            <span className="text-body-sm font-medium">Crop</span>
          </button>
        </div>

        {/* Tool Content */}
        <div className="p-4">
          {mode === 'filter' && (
            <FilterSelector
              currentFilter={currentEdits.filter}
              onFilterChange={(filter) => updateEdits({ filter })}
              previewUrl={currentMedia.url}
            />
          )}

          {mode === 'adjust' && (
            <AdjustmentPanel
              adjustments={currentEdits.adjustments}
              onAdjustmentChange={(adjustments) => updateEdits({ adjustments })}
            />
          )}

          {mode === 'crop' && (
            <CropPanel
              crop={currentEdits.crop}
              rotation={currentEdits.rotation}
              zoom={currentEdits.zoom}
              onCropChange={(crop) => updateEdits({ crop })}
              onRotate={handleRotate}
              onZoomChange={(zoom) => updateEdits({ zoom })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

import { RotateCw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { ASPECT_RATIOS } from '@/types/upload';
import type { PhotoEdits } from '@/types/upload';

interface CropPanelProps {
  crop?: PhotoEdits['crop'];
  rotation: number;
  zoom: number;
  onCropChange: (crop: PhotoEdits['crop']) => void;
  onRotate: () => void;
  onZoomChange: (zoom: number) => void;
}

export default function CropPanel({ crop, rotation, zoom, onCropChange, onRotate, onZoomChange }: CropPanelProps) {
  return (
    <div className="space-y-4">
      {/* Aspect Ratios */}
      <div>
        <p className="text-body-sm font-medium text-foreground mb-2">Aspect Ratio</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              className="flex-shrink-0 px-4 py-2 border border-border rounded-lg text-body-sm text-foreground hover:bg-tertiary transition-colors"
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="flex gap-2">
        <button
          onClick={onRotate}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-lg hover:bg-tertiary transition-colors"
        >
          <RotateCw className="w-5 h-5 text-primary" />
          <span className="text-body-sm text-foreground">Rotate</span>
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-lg hover:bg-tertiary transition-colors">
          <Maximize className="w-5 h-5 text-primary" />
          <span className="text-body-sm text-foreground">Straighten</span>
        </button>
      </div>

      {/* Zoom */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-5 h-5 text-primary" />
            <span className="text-body-sm font-medium text-foreground">Zoom</span>
          </div>
          <span className="text-body-sm text-tertiary-foreground">{zoom.toFixed(1)}x</span>
        </div>

        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-tertiary rounded-lg appearance-none cursor-pointer slider-thumb"
        />
      </div>
    </div>
  );
}

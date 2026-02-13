import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { VideoEdits } from '@/types/upload';

interface VideoTrimmerProps {
  duration: number;
  trim?: VideoEdits['trim'];
  onTrimChange: (start: number, end: number) => void;
  onClose: () => void;
}

export default function VideoTrimmer({ duration, trim, onTrimChange, onClose }: VideoTrimmerProps) {
  const [start, setStart] = useState(trim?.start || 0);
  const [end, setEnd] = useState(trim?.end || duration);

  const handleApply = () => {
    onTrimChange(start, end);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-body font-semibold text-foreground">Trim Video</h3>
        <button onClick={onClose} className="text-tertiary-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        <div className="h-12 bg-tertiary rounded-lg relative overflow-hidden">
          {/* Selected range */}
          <div
            className="absolute top-0 bottom-0 bg-primary/20 border-l-2 border-r-2 border-primary"
            style={{
              left: `${(start / duration) * 100}%`,
              right: `${((duration - end) / duration) * 100}%`,
            }}
          />
        </div>

        {/* Start slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-body-sm text-foreground">Start</label>
            <span className="text-body-sm text-tertiary-foreground">{formatTime(start)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={end}
            step="0.1"
            value={start}
            onChange={(e) => setStart(parseFloat(e.target.value))}
            className="w-full h-2 bg-tertiary rounded-lg appearance-none cursor-pointer slider-thumb"
          />
        </div>

        {/* End slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-body-sm text-foreground">End</label>
            <span className="text-body-sm text-tertiary-foreground">{formatTime(end)}</span>
          </div>
          <input
            type="range"
            min={start}
            max={duration}
            step="0.1"
            value={end}
            onChange={(e) => setEnd(parseFloat(e.target.value))}
            className="w-full h-2 bg-tertiary rounded-lg appearance-none cursor-pointer slider-thumb"
          />
        </div>

        {/* Duration */}
        <div className="text-center text-body-sm text-tertiary-foreground">
          Duration: {formatTime(end - start)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 border-border hover:bg-tertiary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

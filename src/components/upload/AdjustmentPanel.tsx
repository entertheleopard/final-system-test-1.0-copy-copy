import { useState } from 'react';
import { Sun, Contrast, Droplet, Thermometer, Sparkles, Moon, Focus } from 'lucide-react';
import type { PhotoEdits } from '@/types/upload';

interface AdjustmentPanelProps {
  adjustments: PhotoEdits['adjustments'];
  onAdjustmentChange: (adjustments: PhotoEdits['adjustments']) => void;
}

type AdjustmentType = keyof PhotoEdits['adjustments'];

const ADJUSTMENTS: Array<{
  key: AdjustmentType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  min: number;
  max: number;
}> = [
  { key: 'brightness', label: 'Brightness', icon: Sun, min: -100, max: 100 },
  { key: 'contrast', label: 'Contrast', icon: Contrast, min: -100, max: 100 },
  { key: 'saturation', label: 'Saturation', icon: Droplet, min: -100, max: 100 },
  { key: 'warmth', label: 'Warmth', icon: Thermometer, min: -50, max: 50 },
  { key: 'highlights', label: 'Highlights', icon: Sparkles, min: -100, max: 100 },
  { key: 'shadows', label: 'Shadows', icon: Moon, min: -100, max: 100 },
  { key: 'sharpness', label: 'Sharpness', icon: Focus, min: 0, max: 100 },
];

export default function AdjustmentPanel({ adjustments, onAdjustmentChange }: AdjustmentPanelProps) {
  const [activeAdjustment, setActiveAdjustment] = useState<AdjustmentType>('brightness');

  const handleChange = (key: AdjustmentType, value: number) => {
    onAdjustmentChange({
      ...adjustments,
      [key]: value,
    });
  };

  const activeConfig = ADJUSTMENTS.find(a => a.key === activeAdjustment)!;
  const Icon = activeConfig.icon;

  return (
    <div className="space-y-4">
      {/* Adjustment Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {ADJUSTMENTS.map((adj) => {
          const AdjIcon = adj.icon;
          const isActive = activeAdjustment === adj.key;
          const hasValue = adjustments[adj.key] !== 0;

          return (
            <button
              key={adj.key}
              onClick={() => setActiveAdjustment(adj.key)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive ? 'bg-primary/10 text-primary' : 'text-tertiary-foreground'
              }`}
            >
              <AdjIcon className={`w-5 h-5 ${hasValue ? 'text-primary' : ''}`} />
              <span className="text-caption">{adj.label}</span>
            </button>
          );
        })}
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-body-sm font-medium text-foreground">{activeConfig.label}</span>
          </div>
          <span className="text-body-sm text-tertiary-foreground">
            {adjustments[activeAdjustment]}
          </span>
        </div>

        <input
          type="range"
          min={activeConfig.min}
          max={activeConfig.max}
          value={adjustments[activeAdjustment]}
          onChange={(e) => handleChange(activeAdjustment, parseInt(e.target.value))}
          className="w-full h-2 bg-tertiary rounded-lg appearance-none cursor-pointer slider-thumb"
        />

        <div className="flex justify-between text-caption text-tertiary-foreground">
          <span>{activeConfig.min}</span>
          <button
            onClick={() => handleChange(activeAdjustment, 0)}
            className="text-primary hover:underline"
          >
            Reset
          </button>
          <span>{activeConfig.max}</span>
        </div>
      </div>
    </div>
  );
}

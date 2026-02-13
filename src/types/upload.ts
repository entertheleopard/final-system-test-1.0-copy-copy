export type MediaType = 'image' | 'video';

export type MediaFile = {
  id: string;
  file: File;
  type: MediaType;
  url: string;
  thumbnail?: string;
  duration?: number;
};

export type PhotoEdits = {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotation: number;
  zoom: number;
  filter?: string;
  adjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
    highlights: number;
    shadows: number;
    sharpness: number;
  };
};

export type VideoEdits = {
  trim?: {
    start: number;
    end: number;
  };
  clips?: VideoClip[];
  aspectRatio: string;
  coverFrame: number;
  audio: {
    muted: boolean;
    volume: number;
    musicTrack?: MusicTrack;
    musicVolume: number;
  };
};

export type VideoClip = {
  id: string;
  start: number;
  end: number;
  order: number;
};

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  duration: number;
  previewUrl?: string;
  coverUrl?: string;
};

export type EditedMedia = {
  id: string;
  originalFile: MediaFile;
  type: MediaType;
  edits: PhotoEdits | VideoEdits;
  finalUrl: string;
};

export type AspectRatio = {
  label: string;
  value: string;
  ratio: number;
};

export const ASPECT_RATIOS: AspectRatio[] = [
  { label: 'Original', value: 'original', ratio: 0 },
  { label: 'Square', value: '1:1', ratio: 1 },
  { label: 'Portrait', value: '4:5', ratio: 4 / 5 },
  { label: 'Landscape', value: '16:9', ratio: 16 / 9 },
];

export const PHOTO_FILTERS = [
  { id: 'none', name: 'Normal', filter: 'none' },
  { id: 'clarendon', name: 'Clarendon', filter: 'contrast(1.2) saturate(1.35)' },
  { id: 'gingham', name: 'Gingham', filter: 'brightness(1.05) hue-rotate(-10deg)' },
  { id: 'moon', name: 'Moon', filter: 'grayscale(1) contrast(1.1) brightness(1.1)' },
  { id: 'lark', name: 'Lark', filter: 'contrast(0.9) brightness(1.1) saturate(1.2)' },
  { id: 'reyes', name: 'Reyes', filter: 'sepia(0.22) brightness(1.1) contrast(0.85)' },
  { id: 'juno', name: 'Juno', filter: 'sepia(0.35) contrast(1.15) brightness(1.15) saturate(1.8)' },
  { id: 'slumber', name: 'Slumber', filter: 'saturate(0.66) brightness(1.05)' },
  { id: 'crema', name: 'Crema', filter: 'sepia(0.5) contrast(1.25) brightness(1.15) saturate(0.9)' },
  { id: 'ludwig', name: 'Ludwig', filter: 'sepia(0.25) contrast(1.05) brightness(1.05) saturate(2)' },
];

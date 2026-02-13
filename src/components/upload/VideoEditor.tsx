import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Music, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MusicSelector from './MusicSelector';
import VideoTrimmer from './VideoTrimmer';
import type { MediaFile, EditedMedia, VideoEdits, MusicTrack } from '@/types/upload';

interface VideoEditorProps {
  media: MediaFile[];
  onComplete: (edited: EditedMedia[]) => void;
  onBack: () => void;
}

type EditorMode = 'trim' | 'music' | 'audio';

export default function VideoEditor({ media, onComplete, onBack }: VideoEditorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<EditorMode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [edits, setEdits] = useState<Record<string, VideoEdits>>(() => {
    const initial: Record<string, VideoEdits> = {};
    media.forEach(m => {
      initial[m.id] = {
        aspectRatio: 'original',
        coverFrame: 0,
        audio: {
          muted: false,
          volume: 100,
          musicVolume: 50,
        },
      };
    });
    return initial;
  });

  const currentMedia = media[currentIndex];
  const currentEdits = edits[currentMedia.id];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const updateEdits = (updates: Partial<VideoEdits>) => {
    setEdits({
      ...edits,
      [currentMedia.id]: {
        ...currentEdits,
        ...updates,
      },
    });
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    updateEdits({
      audio: {
        ...currentEdits.audio,
        muted: !currentEdits.audio.muted,
      },
    });
  };

  const handleMusicSelect = (track: MusicTrack) => {
    updateEdits({
      audio: {
        ...currentEdits.audio,
        musicTrack: track,
      },
    });
    setMode(null);
  };

  const handleTrimChange = (start: number, end: number) => {
    updateEdits({
      trim: { start, end },
    });
  };

  const handleNext = () => {
    const editedMedia: EditedMedia[] = media.map(m => ({
      id: m.id,
      originalFile: m,
      type: 'video',
      edits: edits[m.id],
      finalUrl: m.url,
    }));
    onComplete(editedMedia);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={onBack} className="text-foreground hover:text-tertiary-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-h3 font-semibold text-foreground">Edit Video</h1>
        <Button
          onClick={handleNext}
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
        >
          Next
        </Button>
      </header>

      {/* Video Preview */}
      <div className="flex-1 flex items-center justify-center bg-black p-4 relative">
        <video
          ref={videoRef}
          src={currentMedia.url}
          className="max-w-full max-h-full object-contain"
          muted={currentEdits.audio.muted}
        />

        {/* Play/Pause Overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
        >
          {!isPlaying && (
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-black ml-1" />
            </div>
          )}
        </button>

        {/* Audio indicator */}
        {currentEdits.audio.musicTrack && (
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg flex items-center gap-2">
            <Music className="w-4 h-4" />
            <span className="text-body-sm">{currentEdits.audio.musicTrack.title}</span>
          </div>
        )}
      </div>

      {/* Editor Tools */}
      <div className="border-t border-border bg-background">
        {mode === null ? (
          <div className="p-4 space-y-3">
            <button
              onClick={() => setMode('trim')}
              className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-tertiary transition-colors"
            >
              <Scissors className="w-5 h-5 text-primary" />
              <div className="flex-1 text-left">
                <p className="text-body font-medium text-foreground">Trim</p>
                <p className="text-caption text-tertiary-foreground">Cut video length</p>
              </div>
            </button>

            <button
              onClick={() => setMode('music')}
              className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-tertiary transition-colors"
            >
              <Music className="w-5 h-5 text-primary" />
              <div className="flex-1 text-left">
                <p className="text-body font-medium text-foreground">Add Music</p>
                <p className="text-caption text-tertiary-foreground">
                  {currentEdits.audio.musicTrack ? currentEdits.audio.musicTrack.title : 'Select a track'}
                </p>
              </div>
            </button>

            <button
              onClick={toggleMute}
              className="w-full flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-tertiary transition-colors"
            >
              {currentEdits.audio.muted ? (
                <VolumeX className="w-5 h-5 text-primary" />
              ) : (
                <Volume2 className="w-5 h-5 text-primary" />
              )}
              <div className="flex-1 text-left">
                <p className="text-body font-medium text-foreground">Original Audio</p>
                <p className="text-caption text-tertiary-foreground">
                  {currentEdits.audio.muted ? 'Muted' : 'Playing'}
                </p>
              </div>
            </button>
          </div>
        ) : mode === 'trim' ? (
          <VideoTrimmer
            duration={currentMedia.duration || 0}
            trim={currentEdits.trim}
            onTrimChange={handleTrimChange}
            onClose={() => setMode(null)}
          />
        ) : mode === 'music' ? (
          <MusicSelector
            onSelect={handleMusicSelect}
            onClose={() => setMode(null)}
          />
        ) : null}
      </div>
    </div>
  );
}

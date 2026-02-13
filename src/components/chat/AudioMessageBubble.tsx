import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioMessageBubbleProps {
  src: string;
  duration?: number;
  isMe: boolean;
}

export default function AudioMessageBubble({ src, duration = 0, isMe }: AudioMessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(percent || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    // Listen for other audio playing to pause this one
    const handleGlobalPlay = (e: CustomEvent) => {
      if (e.detail.id !== src && isPlaying) {
        audio.pause();
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    window.addEventListener('audio-play', handleGlobalPlay as EventListener);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      window.removeEventListener('audio-play', handleGlobalPlay as EventListener);
    };
  }, [src, isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Dispatch event to pause others
      window.dispatchEvent(new CustomEvent('audio-play', { detail: { id: src } }));
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Use provided duration if available, otherwise fallback to audio metadata duration (once loaded)
  const displayDuration = duration || (audioRef.current?.duration || 0);

  return (
    <div className={cn(
      "flex items-center gap-3 p-2 min-w-[200px]",
      isMe ? "text-primary-foreground" : "text-foreground"
    )}>
      <button
        onClick={togglePlay}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
          isMe ? "bg-white/20 hover:bg-white/30" : "bg-tertiary hover:bg-gray-200"
        )}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div className="h-1 bg-current/20 rounded-full overflow-hidden w-full">
          <div 
            className="h-full bg-current transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-medium opacity-80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(displayDuration)}</span>
        </div>
      </div>

      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
    </div>
  );
}

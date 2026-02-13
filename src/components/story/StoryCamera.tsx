import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, RotateCcw, Zap, ZapOff, Camera } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StoryCameraProps {
  onCapture: (file: File, type: 'image' | 'video') => void;
  onClose: () => void;
  onOpenGallery: () => void;
}

export default function StoryCamera({ onCapture, onClose, onOpenGallery }: StoryCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);
  
  const MAX_DURATION = 15000; // 15 seconds

  const {
    isActive,
    isLoading,
    error,
    facingMode,
    flashMode,
    toggleCamera,
    toggleFlash,
    takePhoto,
    startRecording,
    stopRecording,
    retry
  } = useCamera({ 
    videoRef,
    onCapture: (file, type) => {
      // Reset progress when capture completes
      setProgress(0);
      onCapture(file, type);
    }
  });

  // Handle Hold-to-Record
  const handlePointerDown = () => {
    setIsHolding(true);
    startTime.current = Date.now();
    startRecording();

    // Start progress timer
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const p = Math.min((elapsed / MAX_DURATION) * 100, 100);
      setProgress(p);

      if (elapsed >= MAX_DURATION) {
        handlePointerUp();
      }
    }, 16); // ~60fps
  };

  const handlePointerUp = () => {
    if (!isHolding) return;
    
    setIsHolding(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    const elapsed = Date.now() - startTime.current;
    if (elapsed < 300) {
      // Short tap: Take photo instead
      stopRecording(); // Cancel video
      takePhoto();
    } else {
      // Long press: Stop video
      stopRecording();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-black text-white p-6 text-center">
        <Camera className="w-12 h-12 mb-4 text-white/50" />
        <p className="mb-4">Camera access is required to create stories.</p>
        <div className="flex gap-4">
          <Button onClick={retry} variant="secondary">Try Again</Button>
          <Button onClick={onClose} variant="ghost">Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      {/* Camera Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          facingMode === 'user' && "scale-x-[-1]",
          isLoading ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-center z-20 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white">
          <X className="w-6 h-6" />
        </button>
        
        <button onClick={toggleFlash} className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white">
          {flashMode === 'on' ? <Zap className="w-6 h-6 fill-yellow-400 text-yellow-400" /> : <ZapOff className="w-6 h-6" />}
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-safe-bottom flex items-center justify-between z-20 bg-gradient-to-t from-black/50 to-transparent">
        {/* Gallery */}
        <button 
          onClick={onOpenGallery}
          className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ImageIcon className="w-6 h-6" />
        </button>

        {/* Shutter Button */}
        <div className="relative">
          {/* Progress Ring */}
          <svg className="absolute inset-0 -m-1 w-[88px] h-[88px] rotate-[-90deg] pointer-events-none">
            <circle
              cx="44"
              cy="44"
              r="42"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray="264"
              strokeDashoffset={264 - (264 * progress) / 100}
              className="transition-all duration-75 ease-linear"
              style={{ opacity: isHolding ? 1 : 0 }}
            />
          </svg>
          
          <button
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={cn(
              "w-20 h-20 rounded-full border-4 border-white transition-all duration-200",
              isHolding ? "bg-red-500 scale-90" : "bg-white hover:bg-gray-200"
            )}
          />
        </div>

        {/* Flip Camera */}
        <button 
          onClick={toggleCamera}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors active:rotate-180 duration-500"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

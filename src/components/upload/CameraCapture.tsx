import { useState, useRef, useEffect } from 'react';
import { 
  X, RotateCcw, Zap, ZapOff, Camera as CameraIcon, 
  CameraOff, MicOff, Settings, Grid3X3, Maximize, 
  Minus, Plus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCamera } from '@/hooks/useCamera';

interface CameraCaptureProps {
  onCapture: (file: File, type: 'image' | 'video') => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [showGrid, setShowGrid] = useState(false);
  const [showLevel, setShowLevel] = useState(false);
  const [showScreenFlash, setShowScreenFlash] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const {
    isActive,
    isLoading,
    error,
    facingMode,
    flashMode,
    zoom,
    capabilities,
    isRecording,
    recordingTime,
    toggleCamera,
    toggleFlash,
    setZoomLevel,
    takePhoto,
    startRecording,
    stopRecording,
    retry
  } = useCamera({ videoRef, onCapture });

  // Handle Flash UI Feedback
  const handleFlashToggle = async () => {
    await toggleFlash();
    
    // Show message if torch is not supported on rear camera
    if (facingMode === 'environment' && !capabilities.torch) {
      setFlashMessage('Flash not supported on this device');
      setTimeout(() => setFlashMessage(null), 2000);
    }
  };

  // Capture Handler
  const handleCapture = async () => {
    // Screen Flash Logic for Front Camera
    if (flashMode === 'on' && facingMode === 'user' && mode === 'photo') {
      setShowScreenFlash(true);
      // Wait for screen to light up
      await new Promise(resolve => setTimeout(resolve, 200));
      await takePhoto();
      setTimeout(() => setShowScreenFlash(false), 100);
    } else {
      if (mode === 'photo') {
        // Visual shutter effect
        const flashEl = document.createElement('div');
        flashEl.className = 'absolute inset-0 bg-white z-50 animate-out fade-out duration-150 pointer-events-none';
        videoRef.current?.parentElement?.appendChild(flashEl);
        setTimeout(() => flashEl.remove(), 150);
        
        await takePhoto();
      } else {
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    }
  };

  // Gestures
  const [pinchStartDist, setPinchStartDist] = useState<number | null>(null);
  const [pinchStartZoom, setPinchStartZoom] = useState(1);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setPinchStartDist(dist);
      setPinchStartZoom(zoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDist !== null && capabilities.zoom) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / pinchStartDist;
      setZoomLevel(pinchStartZoom * scale);
    }
  };

  // Error State
  if (error) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-foreground">
          <X className="w-8 h-8" />
        </button>
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <CameraOff className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-h2 font-semibold text-foreground mb-3">Camera Access Needed</h2>
        <p className="text-body text-tertiary-foreground mb-8 max-w-xs">
          Please enable camera access in your browser settings to continue.
        </p>
        <Button onClick={retry} className="w-full bg-gradient-primary text-primary-foreground h-12">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30 safe-top bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white">
          <X className="w-6 h-6" />
        </button>
        
        {isRecording && (
          <div className="bg-red-500/90 px-3 py-1 rounded-full text-white font-mono text-sm animate-pulse shadow-lg">
            00:{recordingTime.toString().padStart(2, '0')} / 01:00
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={() => setShowGrid(!showGrid)} className={cn("p-2 rounded-full backdrop-blur-sm", showGrid ? "bg-yellow-400 text-black" : "bg-black/20 text-white")}>
            <Grid3X3 className="w-6 h-6" />
          </button>
          <button onClick={handleFlashToggle} className={cn("p-2 rounded-full backdrop-blur-sm relative", flashMode === 'on' ? "bg-yellow-400 text-black" : "bg-black/20 text-white")}>
            {flashMode === 'on' ? <Zap className="w-6 h-6 fill-current" /> : <ZapOff className="w-6 h-6" />}
            {flashMessage && (
              <div className="absolute top-full mt-2 right-0 w-max bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg">
                {flashMessage}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Camera Preview */}
      <div 
        className="flex-1 relative bg-black overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setPinchStartDist(null)}
      >
        {/* Screen Flash Overlay */}
        <div className={cn("absolute inset-0 bg-white z-[60] pointer-events-none transition-opacity duration-75", showScreenFlash ? "opacity-100" : "opacity-0")} />

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn("w-full h-full object-cover transition-opacity duration-300", facingMode === 'user' && "scale-x-[-1]", isLoading ? "opacity-0" : "opacity-100")}
        />

        {/* Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3">
            {[...Array(9)].map((_, i) => <div key={i} className="border border-white/20" />)}
          </div>
        )}

        {/* Zoom Indicator */}
        {capabilities.zoom && (
          <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none z-20">
            <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-medium">
              {zoom.toFixed(1)}x
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pb-8 safe-bottom z-30">
        {/* Zoom Slider */}
        {capabilities.zoom && (
          <div className="flex items-center justify-center gap-4 mb-6">
            <button onClick={() => setZoomLevel(Math.max(1, zoom - 0.5))} className="p-1 text-white/70 hover:text-white"><Minus className="w-4 h-4" /></button>
            <input
              type="range"
              min={capabilities.zoom.min}
              max={Math.min(capabilities.zoom.max, 5)}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-48 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider-thumb-white"
            />
            <button onClick={() => setZoomLevel(Math.min(capabilities.zoom.max, zoom + 0.5))} className="p-1 text-white/70 hover:text-white"><Plus className="w-4 h-4" /></button>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex justify-center gap-8 mb-8">
          <button onClick={() => setMode('photo')} className={cn("text-sm font-bold uppercase tracking-widest transition-all", mode === 'photo' ? "text-yellow-400 scale-110" : "text-white/60")}>Photo</button>
          <button onClick={() => setMode('video')} className={cn("text-sm font-bold uppercase tracking-widest transition-all", mode === 'video' ? "text-yellow-400 scale-110" : "text-white/60")}>Video</button>
        </div>

        {/* Shutter Area */}
        <div className="flex items-center justify-between px-4">
          <div className="w-12" /> 
          
          <button
            onClick={handleCapture}
            className={cn(
              "relative w-20 h-20 rounded-full border-4 transition-all duration-200 flex items-center justify-center shadow-lg",
              mode === 'video' && isRecording ? "border-red-500 bg-red-500/20 scale-110" : "border-white bg-white/20 hover:bg-white/30 active:scale-95"
            )}
          >
            <div className={cn("w-16 h-16 rounded-full transition-all duration-200 shadow-inner", mode === 'video' && isRecording ? "bg-red-500 scale-75 rounded-lg" : "bg-white")} />
          </button>

          <button onClick={toggleCamera} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all active:rotate-180 duration-500">
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

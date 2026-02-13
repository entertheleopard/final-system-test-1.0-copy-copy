import { useState, useRef, useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { X, RotateCcw, Mic, MicOff, Video, VideoOff, MoreHorizontal, Settings, Zap, ZapOff, Timer, Heart, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LiveComments from './LiveComments';
import LiveSettingsPanel, { LiveSettings } from './LiveSettingsPanel';
import { cn } from '@/lib/utils';

interface LiveStreamBroadcasterProps {
  onClose: () => void;
}

type CountdownOption = 0 | 3 | 5 | 10;

export default function LiveStreamBroadcaster({ onClose }: LiveStreamBroadcasterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Live State
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [giftTotal, setGiftTotal] = useState(0);
  const [incomingGifts, setIncomingGifts] = useState<{ id: number; name: string; icon: string }[]>([]);
  const [hearts, setHearts] = useState<{ id: number; x: number; color: string }[]>([]);
  
  // Setup State
  const [countdown, setCountdown] = useState<CountdownOption>(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState<LiveSettings>({
    allowComments: true,
    allowGifts: true,
    showViewerCount: true,
    mirrorCamera: false,
    filterKeywords: false,
  });

  // Camera Hook
  const {
    isActive,
    isLoading,
    error,
    facingMode,
    flashMode,
    capabilities,
    toggleCamera,
    toggleFlash,
    retry
  } = useCamera({ videoRef });

  // Interruption Handling
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, onClose]);

  // Timer, Viewer Simulation, and Incoming Interactions
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
        setViewers(prev => Math.max(0, prev + (Math.floor(Math.random() * 10) - 4)));

        // Simulate incoming hearts
        if (Math.random() > 0.7) {
          const id = Date.now();
          const colors = ['text-red-500', 'text-pink-500', 'text-purple-500', 'text-orange-500'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          const x = Math.random() * 40 - 20;
          setHearts(prev => [...prev, { id, x, color }]);
          setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 2000);
        }

        // Simulate incoming gifts (if enabled)
        if (settings.allowGifts && Math.random() > 0.95) {
          const gifts = [
            { name: 'Rose', icon: '🌹', value: 1 },
            { name: 'Coffee', icon: '☕', value: 5 },
            { name: 'Heart', icon: '💖', value: 10 },
          ];
          const gift = gifts[Math.floor(Math.random() * gifts.length)];
          const id = Date.now();
          
          setIncomingGifts(prev => [...prev, { id, name: gift.name, icon: gift.icon }]);
          setGiftTotal(prev => prev + gift.value);
          
          setTimeout(() => setIncomingGifts(prev => prev.filter(g => g.id !== id)), 3000);
        }

      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLive, settings.allowGifts]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSequence = () => {
    if (countdown === 0) {
      setIsLive(true);
      setViewers(100);
    } else {
      setIsCountingDown(true);
      setCountdownValue(countdown);
      
      const timer = setInterval(() => {
        setCountdownValue(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCountingDown(false);
            setIsLive(true);
            setViewers(100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleFlashToggle = async () => {
    await toggleFlash();
  };

  // Error State
  if (error) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <VideoOff className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">Camera Unavailable</h3>
        <p className="text-white/60 text-sm mb-6">Exiting live mode...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      {/* Camera Preview Layer */}
      <div className="absolute inset-0 z-0 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            (facingMode === 'user' || settings.mirrorCamera) && "scale-x-[-1]",
            isLoading ? "opacity-0" : "opacity-100"
          )}
        />
        
        {/* Front Camera Ring Light / Screen Flash Simulation */}
        {facingMode === 'user' && flashMode === 'on' && (
          <div className="absolute inset-0 border-[20px] border-white/80 pointer-events-none z-10 rounded-lg" />
        )}
      </div>

      {/* Countdown Overlay */}
      {isCountingDown && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
          <div className="text-[10rem] font-bold text-white animate-in zoom-in duration-300 drop-shadow-2xl font-mono">
            {countdownValue}
          </div>
        </div>
      )}

      {/* Incoming Gift Animations */}
      <div className="absolute inset-0 pointer-events-none z-40 flex flex-col items-center justify-center">
        {incomingGifts.map(gift => (
          <div key={gift.id} className="animate-in zoom-in fade-in slide-in-from-bottom-10 duration-500 flex flex-col items-center">
            <span className="text-6xl filter drop-shadow-lg">{gift.icon}</span>
            <span className="text-white font-bold text-xl drop-shadow-md mt-2">Received {gift.name}!</span>
          </div>
        ))}
      </div>

      {/* Floating Hearts */}
      <div className="absolute bottom-20 right-4 w-12 h-64 pointer-events-none z-20 overflow-hidden">
        {hearts.map(heart => (
          <div
            key={heart.id}
            className={cn(
              "absolute bottom-0 left-1/2 transition-all duration-[2000ms] ease-out",
              heart.color
            )}
            style={{
              transform: `translate(calc(-50% + ${heart.x}px), -${Math.random() * 200 + 100}px) scale(${Math.random() * 0.5 + 0.8})`,
              opacity: 0,
            }}
          >
            <Heart className="w-8 h-8 fill-current" />
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex items-center justify-between z-50 safe-top pointer-events-none bg-gradient-to-b from-black/50 to-transparent">
        {isLive ? (
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="bg-primary/90 px-3 py-1 rounded-md flex items-center gap-2 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <p className="text-xs font-bold text-white uppercase tracking-wider">LIVE</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
              <p className="text-xs font-mono font-medium text-white">{formatTime(duration)}</p>
            </div>
            {settings.showViewerCount && (
              <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
                <p className="text-xs font-medium text-white flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                  {viewers.toLocaleString()}
                </p>
              </div>
            )}
            {settings.allowGifts && (
              <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 flex items-center gap-1">
                <Gift className="w-3 h-3 text-yellow-400" />
                <p className="text-xs font-bold text-yellow-400">{giftTotal}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-auto">
            <p className="text-sm font-medium text-white">Ready to broadcast</p>
          </div>
        )}

        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Flash Control */}
          <button 
            onClick={handleFlashToggle} 
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md border border-white/10 active:scale-95 touch-manipulation",
              flashMode === 'on' ? "bg-yellow-400 text-black" : "bg-black/40 text-white hover:bg-black/60"
            )}
            style={{ pointerEvents: 'auto' }}
          >
            {flashMode === 'on' ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
          </button>
          
          {/* Camera Flip */}
          <button 
            onClick={toggleCamera} 
            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 border border-white/10 transition-transform active:rotate-180 duration-500 active:scale-95 touch-manipulation"
            style={{ pointerEvents: 'auto' }}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={onClose} 
            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 border border-white/10 active:scale-95 touch-manipulation"
            style={{ pointerEvents: 'auto' }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-30 flex flex-col justify-end pb-8 px-4 safe-bottom pointer-events-auto bg-gradient-to-t from-black/80 via-transparent to-transparent">
        {isLive ? (
          <>
            <LiveComments isBroadcaster isCommentsEnabled={settings.allowComments} />
            <div className="flex items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsMuted(!isMuted)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-white/10", isMuted ? "bg-white text-black" : "bg-black/40 text-white backdrop-blur-md")}>
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button onClick={() => setIsVideoOff(!isVideoOff)} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-white/10", isVideoOff ? "bg-white text-black" : "bg-black/40 text-white backdrop-blur-md")}>
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              <Button onClick={() => { setIsLive(false); onClose(); }} variant="destructive" className="rounded-full px-8 font-semibold shadow-lg">
                End Live
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-bold text-white drop-shadow-md">Go Live</h2>
              <p className="text-white/80 text-sm drop-shadow-md">Interact with your followers in real-time.</p>
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium text-sm">Title</span>
                <button 
                  onClick={() => setShowSettings(true)} 
                  className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 touch-manipulation"
                  style={{ pointerEvents: 'auto' }}
                >
                  <Settings className="w-5 h-5 text-white/70" />
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Add a title..." 
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/40 text-lg font-medium" 
              />
            </div>

            <div className="flex items-center justify-between bg-black/40 backdrop-blur-md rounded-xl p-2 border border-white/10">
              <div className="flex items-center gap-2 px-2">
                <Timer className="w-5 h-5 text-white/70" />
                <span className="text-white/90 text-sm font-medium">Countdown</span>
              </div>
              <div className="flex gap-1">
                {[0, 3, 5, 10].map((val) => (
                  <button 
                    key={val} 
                    onClick={() => setCountdown(val as CountdownOption)} 
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all", 
                      countdown === val ? "bg-white text-black shadow-sm" : "text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {val === 0 ? 'None' : `${val}s`}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleStartSequence} 
              className="w-full h-14 rounded-full bg-gradient-primary text-white text-lg font-bold shadow-lg hover:scale-[1.02] transition-transform"
            >
              Go Live
            </Button>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <LiveSettingsPanel 
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
}

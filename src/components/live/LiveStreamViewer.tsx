import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, Share2, Gift, Send, UserPlus } from 'lucide-react';
import LiveComments from './LiveComments';
import LiveGiftSelector from './LiveGiftSelector';
import { cn, handleAvatarError } from '@/lib/utils';

interface LiveStreamViewerProps {
  streamId: string;
  onClose: () => void;
}

export default function LiveStreamViewer({ streamId, onClose }: LiveStreamViewerProps) {
  const navigate = useNavigate();
  const [showGifts, setShowGifts] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hearts, setHearts] = useState<{ id: number; x: number; color: string }[]>([]);
  const [activeGift, setActiveGift] = useState<{ icon: string; name: string } | null>(null);
  const [commentText, setCommentText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock stream data
  const streamData = {
    username: 'User',
    avatar: '',
    viewers: 0,
    title: 'Live Stream',
  };

  // Handle heart animation
  const addHeart = () => {
    setLikes(prev => prev + 1);
    const id = Date.now();
    const colors = ['text-red-500', 'text-pink-500', 'text-purple-500', 'text-orange-500'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * 40 - 20; // Random x offset

    setHearts(prev => [...prev, { id, x, color }]);

    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id));
    }, 2000);
  };

  const handleSendGift = (gift: { icon: string; name: string }) => {
    setActiveGift(gift);
    setTimeout(() => setActiveGift(null), 3000);
    setShowGifts(false);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Watch ${streamData.username} LIVE!`,
        text: streamData.title,
        url: window.location.href,
      });
    } catch (err) {
      console.log('Share cancelled');
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          src="https://c.animaapp.com/mlkxz4s0AuRnuX/img/ai_1.png" // Placeholder video
          className="w-full h-full object-cover opacity-60"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full p-1 pr-4">
          <img 
            src={streamData.avatar} 
            alt={streamData.username} 
            className="w-8 h-8 rounded-full border border-primary"
            onError={handleAvatarError}
          />
          <div>
            <p className="text-xs font-bold text-white">{streamData.username}</p>
            <p className="text-[10px] text-white/80">{streamData.viewers.toLocaleString()} viewers</p>
          </div>
          <button className="ml-2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-primary-hover transition-colors">
            Follow
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-primary/90 px-3 py-1 rounded-md">
            <p className="text-xs font-bold text-white uppercase tracking-wider">LIVE</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Gift Animation Overlay */}
      {activeGift && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-in zoom-in fade-in duration-500">
          <div className="text-center">
            <div className="text-9xl filter drop-shadow-2xl animate-bounce">
              {activeGift.icon}
            </div>
            <p className="text-2xl font-bold text-white mt-4 text-shadow-lg">
              Sent {activeGift.name}!
            </p>
          </div>
        </div>
      )}

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

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 flex flex-col justify-end pb-4">
        {/* Comments */}
        <LiveComments />

        {/* Bottom Controls */}
        <div className="px-4 flex items-center gap-3">
          {/* Comment Input */}
          <div className="flex-1 bg-black/30 backdrop-blur-md rounded-full flex items-center px-4 py-2 border border-white/10">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Say something..."
              className="bg-transparent border-none outline-none text-white placeholder:text-white/50 text-sm w-full"
            />
            <button 
              disabled={!commentText.trim()}
              className="text-white disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowGifts(true)}
              className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
            >
              <Gift className="w-5 h-5 text-pink-400" />
            </button>
            
            <button 
              onClick={handleShare}
              className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button 
              onClick={addHeart}
              className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors active:scale-90"
            >
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Gift Selector Sheet */}
      {showGifts && (
        <LiveGiftSelector 
          onSendGift={handleSendGift} 
          onClose={() => setShowGifts(false)} 
        />
      )}
    </div>
  );
}

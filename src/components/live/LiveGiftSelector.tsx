import { useState } from 'react';
import { X, Coins, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Gift {
  id: string;
  name: string;
  icon: string;
  cost: number;
}

const GIFTS: Gift[] = [
  { id: '1', name: 'Rose', icon: '🌹', cost: 1 },
  { id: '2', name: 'Coffee', icon: '☕', cost: 5 },
  { id: '3', name: 'Heart', icon: '💖', cost: 10 },
  { id: '4', name: 'Fire', icon: '🔥', cost: 20 },
  { id: '5', name: 'Party', icon: '🎉', cost: 50 },
  { id: '6', name: 'Diamond', icon: '💎', cost: 100 },
  { id: '7', name: 'Crown', icon: '👑', cost: 500 },
  { id: '8', name: 'Rocket', icon: '🚀', cost: 1000 },
];

interface LiveGiftSelectorProps {
  onSendGift: (gift: Gift) => void;
  onClose: () => void;
}

export default function LiveGiftSelector({ onSendGift, onClose }: LiveGiftSelectorProps) {
  const [balance, setBalance] = useState(500);
  const [showCashout, setShowCashout] = useState(false);

  const handleSend = (gift: Gift) => {
    if (balance >= gift.cost) {
      setBalance(prev => prev - gift.cost);
      onSendGift(gift);
    }
  };

  if (showCashout) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300 z-50 border-t border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-h3 font-semibold text-foreground">Cash Out</h3>
          <button onClick={() => setShowCashout(false)} className="text-foreground hover:text-tertiary-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-tertiary rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-tertiary-foreground" />
          </div>
          <p className="text-body font-medium text-foreground mb-2">Feature Unavailable</p>
          <p className="text-body-sm text-tertiary-foreground max-w-xs">
            This feature is not yet available. Please check back later.
          </p>
        </div>
        
        <Button onClick={() => setShowCashout(false)} className="w-full bg-gradient-primary text-primary-foreground">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md rounded-t-2xl p-4 animate-in slide-in-from-bottom duration-300 z-50 border-t border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-white font-bold text-sm">{balance}</span>
          <button 
            onClick={() => setBalance(prev => prev + 100)}
            className="ml-2 text-xs text-primary hover:text-primary-hover font-semibold"
          >
            + Top up
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCashout(true)}
            className="text-xs text-white/70 hover:text-white font-medium"
          >
            Cash Out
          </button>
          <button onClick={onClose} className="text-white hover:text-white/70">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {GIFTS.map((gift) => (
          <button
            key={gift.id}
            onClick={() => handleSend(gift)}
            disabled={balance < gift.cost}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <span className="text-3xl filter drop-shadow-lg">{gift.icon}</span>
            <span className="text-xs font-medium text-white">{gift.name}</span>
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-yellow-400" />
              <span className="text-[10px] text-yellow-400 font-bold">{gift.cost}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

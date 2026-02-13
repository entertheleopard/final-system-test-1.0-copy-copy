import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👍'];

interface EmojiTrayProps {
  isOpen: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function EmojiTray({ isOpen, onSelect, onClose, position }: EmojiTrayProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }} 
      />
      <div 
        className="absolute z-50 flex gap-2 bg-black/80 backdrop-blur-md p-2 rounded-full border border-white/10 animate-in zoom-in-50 fade-in duration-200 shadow-2xl"
        style={position ? { 
          left: '50%', 
          top: '50%', 
          transform: 'translate(-50%, -50%)' 
        } : {
          left: '50%',
          bottom: '80px',
          transform: 'translateX(-50%)'
        }}
      >
        {REACTION_EMOJIS.map((emoji, index) => (
          <button
            key={emoji}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(emoji);
            }}
            className="text-2xl hover:scale-125 transition-transform active:scale-95 p-1"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}

interface EmojiOverlayProps {
  emoji: string | null;
  onComplete: () => void;
}

export function EmojiOverlay({ emoji, onComplete }: EmojiOverlayProps) {
  useEffect(() => {
    if (emoji) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [emoji, onComplete]);

  if (!emoji) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none overflow-hidden">
      <div className="text-9xl animate-in zoom-in-50 fade-in slide-in-from-bottom-10 duration-500 fill-mode-forwards">
        {emoji}
      </div>
    </div>
  );
}

interface CaptionSwipePreviewProps {
  emoji: string | null;
}

export function CaptionSwipePreview({ emoji }: CaptionSwipePreviewProps) {
  if (!emoji) return null;

  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-2xl shadow-xl animate-in fade-in zoom-in duration-150 pointer-events-none z-50">
      {emoji}
    </div>
  );
}

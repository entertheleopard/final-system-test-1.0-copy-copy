import { useState, useRef, useEffect } from 'react';
import { X, Type, Smile, Pen, ChevronLeft, Send, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DraggableOverlay from './DraggableOverlay';
import { cn } from '@/lib/utils';

interface StoryEditorProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  onBack: () => void;
  onPublish: () => void;
}

type OverlayType = 'text' | 'sticker';

interface OverlayItem {
  id: string;
  type: OverlayType;
  content: string; // Text content or emoji
  style?: {
    color: string;
    background?: string;
    fontSize?: number;
  };
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const COLORS = ['#FFFFFF', '#000000', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF'];
const EMOJIS = ['😀', '😂', '😍', '🔥', '💯', '🎉', '❤️', '👍', '👀', '✨'];

export default function StoryEditor({ mediaUrl, mediaType, onBack, onPublish }: StoryEditorProps) {
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isAddingText, setIsAddingText] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [showStickers, setShowStickers] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 5;
      }
    }
  }, [mediaUrl]); // Re-init on media load

  // Drawing Logic
  const startDrawing = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    lastPoint.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing || !isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPoint.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  // Add Text
  const handleAddText = () => {
    if (!textInput.trim()) {
      setIsAddingText(false);
      return;
    }

    const newOverlay: OverlayItem = {
      id: Date.now().toString(),
      type: 'text',
      content: textInput,
      style: { color: textColor },
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0
    };

    setOverlays([...overlays, newOverlay]);
    setTextInput('');
    setIsAddingText(false);
  };

  // Add Sticker
  const handleAddSticker = (emoji: string) => {
    const newOverlay: OverlayItem = {
      id: Date.now().toString(),
      type: 'sticker',
      content: emoji,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0
    };

    setOverlays([...overlays, newOverlay]);
    setShowStickers(false);
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden" ref={containerRef}>
      {/* Media Layer */}
      <div className="absolute inset-0 flex items-center justify-center">
        {mediaType === 'video' ? (
          <video 
            src={mediaUrl} 
            className="w-full h-full object-cover" 
            autoPlay 
            loop 
            muted 
            playsInline 
          />
        ) : (
          <img 
            src={mediaUrl} 
            alt="Story" 
            className="w-full h-full object-cover" 
          />
        )}
      </div>

      {/* Drawing Canvas Layer */}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 z-10 touch-none",
          isDrawing ? "pointer-events-auto cursor-crosshair" : "pointer-events-none"
        )}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
      />

      {/* Overlays Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {overlays.map((overlay) => (
          <DraggableOverlay
            key={overlay.id}
            id={overlay.id}
            initialX={overlay.x}
            initialY={overlay.y}
            isSelected={selectedOverlayId === overlay.id}
            onSelect={() => !isDrawing && setSelectedOverlayId(overlay.id)}
            className="pointer-events-auto"
          >
            {overlay.type === 'text' ? (
              <p 
                className="text-2xl font-bold drop-shadow-md px-2 py-1 rounded"
                style={{ color: overlay.style?.color }}
              >
                {overlay.content}
              </p>
            ) : (
              <div className="text-6xl drop-shadow-md">
                {overlay.content}
              </div>
            )}
          </DraggableOverlay>
        ))}
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-safe-top flex justify-between items-center z-30 bg-gradient-to-b from-black/50 to-transparent pointer-events-auto">
        <button onClick={onBack} className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40">
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAddingText(true)}
            className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40"
          >
            <Type className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowStickers(!showStickers)}
            className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40"
          >
            <Smile className="w-6 h-6" />
          </button>
          <button 
            onClick={() => {
              setIsDrawing(!isDrawing);
              // Update canvas context color when toggling
              const ctx = canvasRef.current?.getContext('2d');
              if (ctx) ctx.strokeStyle = textColor;
            }}
            className={cn(
              "p-2 rounded-full backdrop-blur-md transition-colors",
              isDrawing ? "bg-white text-black" : "bg-black/20 text-white hover:bg-black/40"
            )}
          >
            <Pen className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Sticker Picker */}
      {showStickers && (
        <div className="absolute top-20 right-4 z-40 bg-black/80 backdrop-blur-md rounded-xl p-2 grid grid-cols-5 gap-2 animate-in zoom-in-50 duration-200">
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => handleAddSticker(emoji)}
              className="text-2xl hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Text Input Overlay */}
      {isAddingText && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <input
            autoFocus
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type something..."
            className="bg-transparent text-center text-3xl font-bold text-white placeholder:text-white/50 outline-none w-full max-w-md mb-8"
            style={{ color: textColor }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddText();
            }}
          />
          
          {/* Color Picker */}
          <div className="flex gap-3 mb-8">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => setTextColor(color)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                  textColor === color ? "border-white scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setIsAddingText(false)} variant="ghost" className="text-white">
              Cancel
            </Button>
            <Button onClick={handleAddText} className="bg-white text-black hover:bg-gray-200">
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-safe-bottom flex justify-between items-center z-30 bg-gradient-to-t from-black/50 to-transparent pointer-events-auto">
        <button className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40">
          <Download className="w-6 h-6" />
        </button>

        <Button 
          onClick={onPublish}
          className="bg-white text-black hover:bg-gray-200 rounded-full px-6 h-12 font-semibold flex items-center gap-2 shadow-lg"
        >
          <span>Share to Story</span>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

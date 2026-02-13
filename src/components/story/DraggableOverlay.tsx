import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DraggableOverlayProps {
  id: string;
  initialX?: number;
  initialY?: number;
  initialScale?: number;
  initialRotation?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function DraggableOverlay({
  id,
  initialX = 50,
  initialY = 50,
  initialScale = 1,
  initialRotation = 0,
  isSelected,
  onSelect,
  children,
  className
}: DraggableOverlayProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [scale, setScale] = useState(initialScale);
  const [rotation, setRotation] = useState(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  // Basic Dragging Logic
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (onSelect) onSelect();
    
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { ...position };
    
    // Capture pointer for smooth dragging even if cursor leaves element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // Convert pixel delta to percentage based on viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const dxPercent = (dx / viewportWidth) * 100;
    const dyPercent = (dy / viewportHeight) * 100;

    setPosition({
      x: initialPos.current.x + dxPercent,
      y: initialPos.current.y + dyPercent
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute touch-none select-none cursor-move",
        isSelected && "z-50",
        className
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}
      
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 -m-2 border-2 border-white/50 rounded-lg pointer-events-none" />
      )}
    </div>
  );
}

import { useState, memo } from 'react';
import { cn } from '@/lib/utils';

interface PostActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  onLongPress?: () => void;
  isActive?: boolean;
  activeClass?: string;
  children: React.ReactNode;
  className?: string;
}

export const PostActionButton = memo(({ 
  onClick, 
  onLongPress,
  isActive, 
  activeClass, 
  children,
  className
}: PostActionButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useState<{ current: NodeJS.Timeout | null }>({ current: null })[0];
  const isLongPress = useState<{ current: boolean }>({ current: false })[0];

  const handleTouchStart = () => {
    setIsPressed(true);
    isLongPress.current = false;
    
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        isLongPress.current = true;
        onLongPress();
        // Reset press state visually when long press triggers
        setIsPressed(false);
      }, 500);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // If it was a long press, prevent the click from firing if possible
    // Note: onClick usually fires after onTouchEnd. We handle the check in handleClick.
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
      isLongPress.current = false;
      return;
    }
    onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => {
        setIsPressed(false);
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        setIsPressed(false);
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
      }}
      tabIndex={-1}
      className={cn(
        "transition-transform duration-75 ease-out select-none touch-manipulation",
        // Disable all focus styles
        "outline-none focus:outline-none focus:ring-0 focus:border-none focus-visible:ring-0 focus-visible:outline-none",
        // Ensure focus doesn't trigger scale or color changes
        "focus:scale-100 focus:opacity-100",
        
        isPressed ? "scale-90 text-tertiary-foreground" : "scale-100",
        !isPressed && isActive ? activeClass : "",
        !isPressed && !isActive ? "text-foreground" : "",
        className
      )}
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        outline: 'none'
      }}
    >
      {children}
    </button>
  );
});

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProfileActionButtonProps extends React.ComponentProps<typeof Button> {}

export function ProfileActionButton({ className, ...props }: ProfileActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Button
      className={cn(
        "transition-transform duration-100 ease-out",
        // Disable default focus ring to prevent persistent focus state visual
        "focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none",
        // Apply scale and opacity only when pressed
        isPressed ? "scale-95 opacity-80" : "scale-100 opacity-100",
        className
      )}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      {...props}
    />
  );
}

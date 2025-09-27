import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileFloatingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
}

export const MobileFloatingButton: React.FC<MobileFloatingButtonProps> = ({
  children,
  onClick,
  className,
  variant = "default",
  size = "default",
  disabled = false,
  position = "bottom-right"
}) => {
  const isMobile = useIsMobile();

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4", 
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2"
  };

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={isMobile ? "lg" : size}
      disabled={disabled}
      className={cn(
        // Base floating styles
        "fixed z-40 shadow-lg transition-all duration-300",
        
        // Position
        positionClasses[position],
        
        // Mobile optimizations
        isMobile && [
          "h-14 w-14 rounded-full",
          "hover:scale-110 active:scale-95",
          "shadow-xl backdrop-blur-sm",
          "border border-white/20"
        ],
        
        // Desktop styles
        !isMobile && [
          "h-12 w-12 rounded-full",
          "hover:scale-105"
        ],
        
        // Animations
        "animate-fade-in",
        "hover:shadow-xl",
        
        className
      )}
    >
      {children}
    </Button>
  );
};
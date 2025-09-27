import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileGestures } from '@/hooks/useMobileGestures';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[]; // Percentage heights [30, 60, 90]
  defaultSnapPoint?: number;
  className?: string;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [30, 90],
  defaultSnapPoint = 1,
  className
}) => {
  const isMobile = useIsMobile();
  const [currentSnapPoint, setCurrentSnapPoint] = useState(defaultSnapPoint);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const { gestures } = useMobileGestures({
    onSwipeDown: () => {
      if (currentSnapPoint === 0) {
        onClose();
      } else {
        setCurrentSnapPoint(Math.max(0, currentSnapPoint - 1));
      }
    },
    onSwipeUp: () => {
      setCurrentSnapPoint(Math.min(snapPoints.length - 1, currentSnapPoint + 1));
    }
  });

  // Don't render if not mobile or not open
  if (!isMobile || !isOpen) {
    return null;
  }

  const currentHeight = snapPoints[currentSnapPoint];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        {...gestures}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl transition-all duration-300 ease-out",
          isDragging ? "transition-none" : "",
          className
        )}
        style={{
          height: `${currentHeight}vh`,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)'
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-6 pb-4 border-b border-border">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
};
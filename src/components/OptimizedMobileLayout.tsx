import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileSafeAreaWrapper } from './MobileSafeAreaWrapper';

interface OptimizedMobileLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export const OptimizedMobileLayout: React.FC<OptimizedMobileLayoutProps> = ({
  children,
  header,
  footer,
  className,
  padding = true
}) => {
  const isMobile = useIsMobile();

  return (
    <MobileSafeAreaWrapper>
      <div className={cn(
        "min-h-screen flex flex-col",
        isMobile && "min-h-screen-safe",
        className
      )}>
        {/* Header */}
        {header && (
          <header className={cn(
            "flex-shrink-0 z-30",
            isMobile && [
              "sticky top-0",
              "bg-background/80 backdrop-blur-md",
              "border-b border-border/50"
            ]
          )}>
            {header}
          </header>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 relative",
          padding && (isMobile ? "p-4" : "p-6"),
          isMobile && "pb-20" // Space for floating buttons
        )}>
          {children}
        </main>

        {/* Footer */}
        {footer && (
          <footer className={cn(
            "flex-shrink-0 z-30",
            isMobile && [
              "sticky bottom-0",
              "bg-background/80 backdrop-blur-md",
              "border-t border-border/50"
            ]
          )}>
            {footer}
          </footer>
        )}
      </div>
    </MobileSafeAreaWrapper>
  );
};
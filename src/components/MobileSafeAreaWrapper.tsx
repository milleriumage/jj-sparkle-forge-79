import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileSafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
  excludeTop?: boolean;
  excludeBottom?: boolean;
}

export const MobileSafeAreaWrapper: React.FC<MobileSafeAreaWrapperProps> = ({
  children,
  className,
  excludeTop = false,
  excludeBottom = false
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className={cn(
      "w-full",
      !excludeTop && "pt-safe-area-top",
      !excludeBottom && "pb-safe-area-bottom",
      className
    )}>
      {children}
    </div>
  );
};

// CSS para safe areas mobile - adicionado automaticamente via Tailwind
export const mobileSafeAreaStyles = `
  .pt-safe-area-top {
    padding-top: env(safe-area-inset-top);
  }
  
  .pb-safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .pl-safe-area-left {
    padding-left: env(safe-area-inset-left);
  }
  
  .pr-safe-area-right {
    padding-right: env(safe-area-inset-right);
  }
  
  /* Viewport height com safe area */
  .h-screen-safe {
    height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  }
  
  .min-h-screen-safe {
    min-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  }
`;
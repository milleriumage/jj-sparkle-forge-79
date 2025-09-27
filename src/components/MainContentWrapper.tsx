import React from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

interface MainContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContentWrapper: React.FC<MainContentWrapperProps> = ({
  children,
  className
}) => {
  const { open } = useSidebar();

  return (
    <div 
      className={cn(
        "min-h-screen transition-all duration-300 ease-in-out",
        open ? "ml-64" : "ml-16", // Adjust margin based on sidebar state
        className
      )}
    >
      {children}
    </div>
  );
};
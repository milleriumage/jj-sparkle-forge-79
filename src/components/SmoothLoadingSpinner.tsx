import React from 'react';
import { cn } from '@/lib/utils';

interface SmoothLoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "dots" | "spinner" | "bars" | "pulse";
}

export const SmoothLoadingSpinner: React.FC<SmoothLoadingSpinnerProps> = ({
  size = "md",
  className,
  text,
  variant = "spinner"
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base", 
    xl: "text-lg"
  };

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-1">
            <div className={cn("rounded-full bg-primary animate-pulse", sizeClasses[size])} style={{ animationDelay: '0ms' }} />
            <div className={cn("rounded-full bg-primary animate-pulse", sizeClasses[size])} style={{ animationDelay: '150ms' }} />
            <div className={cn("rounded-full bg-primary animate-pulse", sizeClasses[size])} style={{ animationDelay: '300ms' }} />
          </div>
        );
      
      case "bars":
        return (
          <div className="flex items-end space-x-1">
            <div className={cn("bg-primary animate-pulse", sizeClasses[size], "w-1")} style={{ animationDelay: '0ms' }} />
            <div className={cn("bg-primary animate-pulse", sizeClasses[size], "w-1")} style={{ animationDelay: '100ms' }} />
            <div className={cn("bg-primary animate-pulse", sizeClasses[size], "w-1")} style={{ animationDelay: '200ms' }} />
            <div className={cn("bg-primary animate-pulse", sizeClasses[size], "w-1")} style={{ animationDelay: '300ms' }} />
          </div>
        );
      
      case "pulse":
        return (
          <div 
            className={cn(
              "rounded-full bg-primary animate-pulse",
              sizeClasses[size]
            )}
          />
        );
      
      default: // spinner
        return (
          <div 
            className={cn(
              "animate-spin rounded-full border-2 border-primary border-t-transparent",
              sizeClasses[size]
            )}
          />
        );
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      {renderSpinner()}
      {text && (
        <p className={cn(
          "text-muted-foreground animate-fade-in",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
};
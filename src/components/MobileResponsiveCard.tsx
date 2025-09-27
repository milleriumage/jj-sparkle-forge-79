import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  clickable?: boolean;
  onClick?: () => void;
}

export const MobileResponsiveCard: React.FC<MobileResponsiveCardProps> = ({
  children,
  className,
  variant = "default",
  padding = "md",
  clickable = false,
  onClick
}) => {
  const isMobile = useIsMobile();

  const variantClasses = {
    default: "bg-card border shadow-sm",
    elevated: "bg-card border shadow-lg hover:shadow-xl transition-shadow duration-300",
    outlined: "bg-transparent border-2 border-primary/20",
    glass: "bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
  };

  const paddingClasses = {
    none: "p-0",
    sm: isMobile ? "p-3" : "p-4",
    md: isMobile ? "p-4" : "p-6", 
    lg: isMobile ? "p-6" : "p-8"
  };

  return (
    <Card
      onClick={clickable ? onClick : undefined}
      className={cn(
        // Base styles
        variantClasses[variant],
        paddingClasses[padding],
        
        // Mobile optimizations
        isMobile && [
          "rounded-2xl",
          "transition-transform duration-200",
          clickable && "active:scale-[0.98]"
        ],
        
        // Desktop styles  
        !isMobile && [
          "rounded-lg",
          clickable && "hover:scale-[1.02] transition-transform duration-200"
        ],
        
        // Clickable styles
        clickable && [
          "cursor-pointer",
          "hover:shadow-lg transition-all duration-200"
        ],
        
        className
      )}
    >
      {children}
    </Card>
  );
};

// Componentes específicos para melhor tipagem
export const MobileCardHeader: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => {
  const isMobile = useIsMobile();
  
  return (
    <CardHeader className={cn(
      isMobile ? "pb-3" : "pb-4",
      className
    )}>
      {children}
    </CardHeader>
  );
};

export const MobileCardTitle: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => {
  const isMobile = useIsMobile();
  
  return (
    <CardTitle className={cn(
      isMobile ? "text-lg" : "text-xl",
      className
    )}>
      {children}
    </CardTitle>
  );
};

export const MobileCardDescription: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => {
  const isMobile = useIsMobile();
  
  return (
    <CardDescription className={cn(
      isMobile ? "text-sm" : "text-base",
      className
    )}>
      {children}
    </CardDescription>
  );
};

export const MobileCardContent: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => {
  const isMobile = useIsMobile();
  
  return (
    <CardContent className={cn(
      isMobile ? "py-3" : "py-4",
      className
    )}>
      {children}
    </CardContent>
  );
};

export const MobileCardFooter: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => {
  const isMobile = useIsMobile();
  
  return (
    <CardFooter className={cn(
      isMobile ? "pt-3 gap-2" : "pt-4 gap-3",
      className
    )}>
      {children}
    </CardFooter>
  );
};
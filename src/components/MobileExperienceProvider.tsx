import React, { createContext, useContext, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePullToRefresh } from '@/hooks/useMobileGestures';
import { SmoothLoadingSpinner } from './SmoothLoadingSpinner';

interface MobileExperienceContextType {
  isMobile: boolean;
  isRefreshing: boolean;
  triggerRefresh: () => Promise<void>;
  showMobileOptimizedUI: boolean;
}

const MobileExperienceContext = createContext<MobileExperienceContextType | null>(null);

export const useMobileExperience = () => {
  const context = useContext(MobileExperienceContext);
  if (!context) {
    throw new Error('useMobileExperience must be used within MobileExperienceProvider');
  }
  return context;
};

interface MobileExperienceProviderProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
}

export const MobileExperienceProvider: React.FC<MobileExperienceProviderProps> = ({
  children,
  onRefresh
}) => {
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMobileOptimizedUI, setShowMobileOptimizedUI] = useState(false);

  // Detectar se deve usar UI mobile otimizada
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTouch = 'ontouchstart' in window;
    
    setShowMobileOptimizedUI(isMobile && (isMobileDevice || isTouch));
  }, [isMobile]);

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      // Simular delay mínimo para UX suave
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsRefreshing(false);
    }
  };

  const {
    pullToRefreshProps,
    isPulling,
    pullProgress
  } = usePullToRefresh(triggerRefresh);

  const contextValue: MobileExperienceContextType = {
    isMobile,
    isRefreshing,
    triggerRefresh,
    showMobileOptimizedUI
  };

  return (
    <MobileExperienceContext.Provider value={contextValue}>
      <div 
        {...(isMobile ? pullToRefreshProps : {})}
        className="min-h-screen relative"
      >
        {/* Pull to refresh indicator */}
        {isMobile && (isPulling || isRefreshing) && (
          <div 
            className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 bg-background/80 backdrop-blur-sm border-b"
            style={{
              transform: `translateY(${isPulling ? pullProgress * 60 - 60 : 0}px)`
            }}
          >
            <SmoothLoadingSpinner 
              size="sm" 
              text={isRefreshing ? "Atualizando..." : "Puxe para atualizar"}
              variant="spinner"
            />
          </div>
        )}

        {children}
      </div>
    </MobileExperienceContext.Provider>
  );
};
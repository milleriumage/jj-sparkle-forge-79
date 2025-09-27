import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { getMediaUrl } from '@/lib/mediaUtils';

interface VideoThumbnailProps {
  src: string;
  poster?: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  title?: string;
  isBlurred?: boolean;
  showPlayButton?: boolean;
}

export const VideoThumbnail = ({ 
  src, 
  poster, 
  alt = "Video", 
  className = "", 
  onClick, 
  onMouseEnter,
  onMouseLeave,
  title,
  isBlurred = false,
  showPlayButton = true
}: VideoThumbnailProps) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Video Element */}
      <video
        src={getMediaUrl(src)}
        poster={poster || getMediaUrl(src) + "#t=0.5"}
        preload="metadata"
        muted
        playsInline
        className={`w-full h-full object-cover cursor-pointer transition-all duration-300 ${
          isBlurred ? 'blur-md' : ''
        }`}
        title={title}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onLoadedData={handleVideoLoad}
        onError={() => {
          // Se o vídeo não carregar, tenta usar imagem de fallback
          if (!imageError) {
            setImageError(true);
          }
        }}
      />
      
      {/* Fallback Image - caso video não carregue */}
      {imageError && (
        <img
          src={getMediaUrl(src)}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover cursor-pointer transition-all duration-300 ${
            isBlurred ? 'blur-md' : ''
          }`}
          title={title}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onError={handleImageError}
        />
      )}

      {/* Play Button Overlay - Otimizado para mobile */}
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 md:opacity-100 sm:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/95 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg transform hover:scale-110 transition-transform duration-200">
            <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-800" />
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!videoLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 backdrop-blur-sm">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
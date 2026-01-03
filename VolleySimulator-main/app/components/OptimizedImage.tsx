'use client';

import Image, { ImageProps } from 'next/image';
import { useState, memo } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackText?: string;
}

/**
 * Optimized Image component with:
 * - Blur placeholder
 * - Error fallback
 * - Lazy loading by default
 * - Proper sizing
 */
function OptimizedImageComponent({
  src,
  alt,
  fallbackSrc,
  fallbackText,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError) {
    if (fallbackSrc) {
      return (
        <Image
          src={fallbackSrc}
          alt={alt}
          className={className}
          {...props}
        />
      );
    }
    
    if (fallbackText) {
      return (
        <div 
          className={`flex items-center justify-center bg-slate-800 text-white font-bold ${className}`}
          style={{ width: props.width, height: props.height }}
        >
          {fallbackText}
        </div>
      );
    }

    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      onError={() => setHasError(true)}
      onLoad={() => setIsLoaded(true)}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMWUyOTNiIi8+PC9zdmc+"
      loading="lazy"
      {...props}
    />
  );
}

export const OptimizedImage = memo(OptimizedImageComponent);

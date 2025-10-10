'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface ProfileAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10'
};

export function ProfileAvatar({ 
  src, 
  alt = 'Profile', 
  size = 'md', 
  className = '' 
}: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];

  // Show fallback if no src, image error, or image hasn't loaded yet
  const showFallback = !src || imageError || !imageLoaded;

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 relative ${className}`}>
      {src && !imageError && (
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
      
      {/* Fallback avatar */}
      <div 
        className={`
          ${sizeClass} 
          bg-gradient-to-br from-[#8952E0] to-[#7A47CC] 
          rounded-full 
          flex items-center justify-center 
          transition-opacity duration-200
          ${showFallback ? 'opacity-100' : 'opacity-0'}
          ${!showFallback ? 'absolute inset-0' : ''}
        `}
      >
        <User className={`${iconSize} text-white`} />
      </div>
    </div>
  );
}

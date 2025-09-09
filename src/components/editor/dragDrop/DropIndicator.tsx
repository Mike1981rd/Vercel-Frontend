'use client';

import React from 'react';

interface DropIndicatorProps {
  isActive: boolean;
  className?: string;
}

export function DropIndicator({ isActive, className = '' }: DropIndicatorProps) {
  if (!isActive) return null;
  
  return (
    <div 
      className={`
        relative w-full h-0.5 
        bg-blue-500 
        before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
        before:w-2 before:h-2 before:bg-blue-500 before:rounded-full
        after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2
        after:w-2 after:h-2 after:bg-blue-500 after:rounded-full
        animate-pulse
        transition-all duration-200 ease-out
        ${className}
      `}
      style={{
        boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)'
      }}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-shimmer" />
      </div>
    </div>
  );
}
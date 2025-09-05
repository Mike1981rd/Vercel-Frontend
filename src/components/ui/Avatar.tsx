import React, { forwardRef } from 'react';
import { cn, getInitials, generateAvatarColor } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square';
  fallback?: React.ReactNode;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    src, 
    alt, 
    name = '', 
    size = 'md', 
    variant = 'circle',
    fallback,
    className, 
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    };

    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-lg',
    };

    // Generate background color based on name
    const backgroundColor = name ? generateAvatarColor(name) : '#64748b';
    const initials = name ? getInitials(name) : '?';

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium text-white bg-gray-500 select-none shrink-0',
          sizeClasses[size],
          shapeClasses[variant],
          className
        )}
        style={{ backgroundColor }}
        {...props}
      >
        {src ? (
          <img
            src={src.startsWith('http') ? src : `http://localhost:5266${src}`}
            alt={alt || name}
            className={cn(
              'h-full w-full object-cover',
              shapeClasses[variant]
            )}
            onError={(e) => {
              // Hide image on error and show initials
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : fallback ? (
          fallback
        ) : (
          <span className="font-semibold">{initials}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group component for multiple avatars
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  spacing?: 'tight' | 'normal';
}

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 3, spacing = 'normal', className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    const spacingClasses = {
      tight: '-space-x-2',
      normal: '-space-x-1',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center', spacingClasses[spacing], className)}
        {...props}
      >
        {visibleChildren}
        {remainingCount > 0 && (
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600 text-sm font-medium border-2 border-white">
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup };
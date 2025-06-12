import { ImgHTMLAttributes } from 'react';
import Image from 'next/image';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

/**
 * Avatar component that adheres to our design token system
 * Uses only semantic color tokens defined in tailwind.config.js
 */
export default function Avatar({
  src,
  alt = "",
  initials,
  size = 'md',
  status,
  className = '',
}: AvatarProps) {
  // Extract initials from name if initials not provided but name-like string is
  const derivedInitials = !initials ? '' : initials.length <= 2 
    ? initials 
    : initials
        .split(' ')
        .map(part => part.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();
  
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };
  
  const statusClasses = {
    online: 'bg-success',
    offline: 'bg-neutral-300',
    busy: 'bg-error',
    away: 'bg-warning',
  };
  
  const statusSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-3.5 w-3.5',
  };
  
  // Size values in pixels for next/image - explicitly defined as numbers
  const sizeValues = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };
  
  // Background color for text avatars
  const bgColor = 'bg-primary-100';
  
  return (
    <div className="relative inline-flex items-center justify-center">
      {src ? (
        // Image avatar with explicit number casts for width and height
        <Image
          src={src}
          alt={alt || "Avatar"}
          width={sizeValues[size]}
          height={sizeValues[size]}
          className={`rounded-full object-cover ${className}`}
        />
      ) : derivedInitials ? (
        // Initials avatar
        <div
          className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-primary-700 font-medium ${className}`}
        >
          {derivedInitials}
        </div>
      ) : (
        // Fallback avatar (user icon)
        <div
          className={`${sizeClasses[size]} bg-neutral-200 rounded-full flex items-center justify-center text-neutral-500 ${className}`}
        >
          <svg className="h-1/2 w-1/2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {/* Status indicator */}
      {status && (
        <span
          className={`absolute bottom-0 right-0 block ${statusSizes[size]} ${statusClasses[status]} rounded-full ring-2 ring-white`}
        />
      )}
    </div>
  );
} 
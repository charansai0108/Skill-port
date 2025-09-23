import { cn } from '@/lib/utils'
import { Camera } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

interface MentorAvatarProps {
  src: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  onImageChange?: () => void
}

export function MentorAvatar({ src, alt = 'User Avatar', size = 'md', className, onImageChange }: MentorAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg',
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-semibold overflow-hidden shadow-sm',
        sizeClasses[size],
        className,
        onImageChange && 'group cursor-pointer'
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {onImageChange && (
        <div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={onImageChange}
        >
          <Camera className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  )
}

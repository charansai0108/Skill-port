import React from 'react'
import { cn } from '@/lib/utils'
import { Camera, User } from 'lucide-react'

interface AdminAvatarProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  editable?: boolean
  onChange?: (file: File) => void
  className?: string
}

export function AdminAvatar({
  src,
  alt = 'Avatar',
  size = 'md',
  editable = false,
  onChange,
  className
}: AdminAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onChange) {
      onChange(file)
    }
  }

  return (
    <div className={cn('relative group', className)}>
      <div
        className={cn(
          'rounded-full bg-gray-100 flex items-center justify-center shadow-lg transition-all duration-300',
          sizeClasses[size],
          editable && 'cursor-pointer hover:shadow-xl hover:scale-105'
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <User className="w-1/2 h-1/2 text-gray-400" />
        )}
      </div>
      
      {editable && (
        <>
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </>
      )}
    </div>
  )
}

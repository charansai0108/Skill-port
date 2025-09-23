'use client'

import { Star } from 'lucide-react'
import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  interactive = false, 
  onRatingChange,
  className 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleClick = (newRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating)
    }
  }

  const handleMouseEnter = (newRating: number) => {
    if (interactive) {
      setHoverRating(newRating)
      setIsHovering(true)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
      setIsHovering(false)
    }
  }

  const displayRating = isHovering ? hoverRating : rating

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1
        const isFilled = starRating <= displayRating
        
        return (
          <button
            key={index}
            type="button"
            className={cn(
              'transition-colors duration-200',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default'
            )}
            onClick={() => handleClick(starRating)}
            onMouseEnter={() => handleMouseEnter(starRating)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300 fill-gray-300'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

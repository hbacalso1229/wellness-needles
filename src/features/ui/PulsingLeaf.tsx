'use client'

import { Leaf } from 'lucide-react'

interface PulsingLeafProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  rotation?: number
  animationDelay?: string
  className?: string
}

export function PulsingLeaf({ 
  size = 'medium', 
  color = 'text-gold/60', 
  rotation = 0,
  animationDelay = '0s',
  className = '' 
}: PulsingLeafProps) {
  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4', 
    large: 'w-8 h-8'
  }

  return (
    <Leaf 
      className={`${sizeClasses[size]} ${color} animate-pulse transform ${className}`}
      style={{ 
        transform: `rotate(${rotation}deg)`,
        animationDelay 
      }}
    />
  )
}

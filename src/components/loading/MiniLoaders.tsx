'use client'
import React from 'react'
import { Loader2, Sparkles, Heart, Star, Zap } from 'lucide-react'

// Button Loading Spinner with Personality
export function ButtonLoader({ 
  size = 'sm',
  color = 'white',
  message = 'Loading...'
}: {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  message?: string
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className="flex items-center gap-2">
      <Sparkles className={`${sizeClasses[size]} animate-spin text-${color}`} />
      <span className={`text-${color} animate-pulse`}>{message}</span>
    </div>
  )
}

// Floating Hearts Loader (perfect for save actions)
export function HeartsLoader({ message = 'Saving...' }: { message?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {[...Array(3)].map((_, i) => (
          <Heart
            key={i}
            className="w-4 h-4 text-pink-500 animate-bounce absolute"
            style={{
              left: `${i * 8}px`,
              animationDelay: `${i * 0.2}s`,
              fill: 'currentColor'
            }}
          />
        ))}
      </div>
      <span className="text-gray-600 animate-fade-in-up ml-6">{message}</span>
    </div>
  )
}

// Stars Loader (perfect for achievements)
export function StarsLoader({ message = 'Updating...' }: { message?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 text-yellow-500 animate-pulse"
            style={{
              animationDelay: `${i * 0.3}s`,
              fill: 'currentColor'
            }}
          />
        ))}
      </div>
      <span className="text-gray-600">{message}</span>
    </div>
  )
}

// Lightning Loader (perfect for quick actions)
export function LightningLoader({ message = 'Processing...' }: { message?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Zap className="w-4 h-4 text-yellow-600 animate-bounce" style={{ fill: 'currentColor' }} />
        <div className="absolute inset-0 animate-ping">
          <Zap className="w-4 h-4 text-yellow-400 opacity-75" style={{ fill: 'currentColor' }} />
        </div>
      </div>
      <span className="text-gray-600">{message}</span>
    </div>
  )
}

// Dots Loader (classic but with personality)
export function DotsLoader({ 
  message = 'Loading...',
  color = 'begin-teal',
  size = 'sm'
}: {
  message?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`${dotSizes[size]} bg-${color} rounded-full animate-bounce`}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <span className="text-gray-600">{message}</span>
    </div>
  )
}

// Pulsing Circle Loader
export function PulseLoader({ 
  message = 'Loading...',
  color = 'begin-teal'
}: {
  message?: string
  color?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className={`w-4 h-4 bg-${color} rounded-full animate-pulse`} />
        <div className={`absolute inset-0 w-4 h-4 bg-${color}/30 rounded-full animate-ping`} />
      </div>
      <span className="text-gray-600 animate-fade-in-up">{message}</span>
    </div>
  )
}

// Spinning Gradient Loader
export function GradientSpinner({ 
  size = 'md',
  message 
}: {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-begin-teal to-begin-cyan animate-spin">
          <div className="absolute inset-1 rounded-full bg-white" />
        </div>
      </div>
      {message && <span className="text-gray-600">{message}</span>}
    </div>
  )
}

// Skeleton Text Loader with Shimmer
export function SkeletonText({ 
  lines = 3,
  className = ''
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse relative overflow-hidden ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
        </div>
      ))}
    </div>
  )
}

// Card Skeleton with Personality
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card-begin p-6 animate-fade-in-up ${className}`}>
      <div className="flex items-start gap-4">
        {/* Avatar skeleton */}
        <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
        
        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 animate-pulse" />
          <SkeletonText lines={2} />
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// Inline Loading Text (for dynamic content updates)
export function InlineLoader({ 
  text = 'Updating',
  dotCount = 3
}: {
  text?: string
  dotCount?: number
}) {
  return (
    <span className="text-gray-500 animate-pulse">
      {text}
      {[...Array(dotCount)].map((_, i) => (
        <span
          key={i}
          className="animate-bounce inline-block"
          style={{ animationDelay: `${i * 0.2}s` }}
        >
          .
        </span>
      ))}
    </span>
  )
}

export default {
  ButtonLoader,
  HeartsLoader,
  StarsLoader,
  LightningLoader,
  DotsLoader,
  PulseLoader,
  GradientSpinner,
  SkeletonText,
  SkeletonCard,
  InlineLoader
}
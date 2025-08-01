'use client'
import React, { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Star, 
  Heart, 
  Zap, 
  BookOpen, 
  Trophy,
  Gift,
  Lightbulb,
  Music,
  Palette,
  Camera,
  Flower
} from 'lucide-react'

interface DelightfulLoadingProps {
  message?: string
  type?: 'default' | 'assessment' | 'profile' | 'teacher' | 'celebration'
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  progress?: number
  childName?: string
  customMessages?: string[]
}

// Fun loading messages that cycle through
const defaultMessages = [
  "✨ Sprinkling some learning magic...",
  "🎭 Discovering amazing talents...",
  "🌟 Unlocking superpowers...",
  "🎨 Painting your unique profile...",
  "🚀 Launching into learning adventures...",
  "🎪 Setting up the learning circus...",
  "🌈 Creating rainbow connections...",
  "🎵 Composing your learning symphony...",
  "🔮 Reading the crystal ball of curiosity...",
  "🎯 Aiming for learning excellence..."
]

const assessmentMessages = [
  "🧠 Our learning scientists are thinking hard...",
  "📊 Crunching numbers with extra sparkles...",
  "🎭 Analyzing your amazing responses...",
  "🌟 Mapping your learning constellation...",
  "🔍 Discovering hidden learning gems...",
  "🎨 Crafting your personalized masterpiece...",
  "⚡ Charging up your learning superpowers...",
  "🎪 Preparing the grand reveal...",
  "🌈 Weaving your learning rainbow...",
  "🎵 Tuning your learning frequency..."
]

const teacherMessages = [
  "👩‍🏫 Gathering your classroom insights...",
  "📚 Organizing student profiles...",
  "📋 Preparing your teaching toolkit...",
  "⭐ Collecting achievement stars...",
  "📈 Calculating learning progress...",
  "🎯 Focusing on student growth...",
  "💡 Illuminating learning paths...",
  "🌟 Highlighting student strengths...",
  "📊 Compiling classroom magic...",
  "🎨 Designing learning experiences..."
]

// Floating animation icons
const floatingIcons = [Star, Heart, Sparkles, Zap, Gift, Lightbulb, Music, Palette, Camera, Flower]

export default function DelightfulLoading({
  message,
  type = 'default',
  size = 'md',
  showProgress = false,
  progress = 0,
  childName,
  customMessages
}: DelightfulLoadingProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [floatingElements, setFloatingElements] = useState<Array<{
    id: number
    Icon: React.ComponentType<any>
    delay: number
    position: { x: number, y: number }
  }>>([])

  // Choose message set based on type
  const getMessages = () => {
    if (customMessages) return customMessages
    switch (type) {
      case 'assessment': return assessmentMessages
      case 'teacher': return teacherMessages
      default: return defaultMessages
    }
  }

  const messages = getMessages()

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [messages.length])

  // Generate floating elements
  useEffect(() => {
    const elements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      Icon: floatingIcons[Math.floor(Math.random() * floatingIcons.length)],
      delay: Math.random() * 2,
      position: {
        x: Math.random() * 100,
        y: Math.random() * 100
      }
    }))
    setFloatingElements(elements)
  }, [])

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return { spinner: 'w-16 h-16', text: 'text-lg', container: 'p-6' }
      case 'lg': return { spinner: 'w-32 h-32', text: 'text-2xl', container: 'p-12' }
      default: return { spinner: 'w-24 h-24', text: 'text-xl', container: 'p-8' }
    }
  }

  const classes = getSizeClasses()
  const currentMessage = message || messages[currentMessageIndex]

  return (
    <div className={`card-begin ${classes.container} text-center relative overflow-hidden`}>
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map(({ id, Icon, delay, position }) => (
          <div
            key={id}
            className="absolute opacity-10 animate-float"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              animationDelay: `${delay}s`,
              animationDuration: '4s'
            }}
          >
            <Icon className="w-6 h-6 text-begin-teal" />
          </div>
        ))}
      </div>

      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-begin-cyan/5 via-begin-teal/5 to-purple-500/5 animate-gradient-shift rounded-card" />

      {/* Main loading content */}
      <div className="relative z-10">
        {/* Main spinner with personality */}
        <div className="relative mx-auto mb-6">
          <div className={`${classes.spinner} bg-gradient-to-br from-begin-teal to-begin-cyan rounded-full flex items-center justify-center animate-spin-slow shadow-lg relative`}>
            {type === 'celebration' ? (
              <Trophy className="h-8 w-8 text-white animate-bounce" />
            ) : type === 'assessment' ? (
              <BookOpen className="h-8 w-8 text-white animate-pulse" />
            ) : (
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            )}
            
            {/* Orbiting elements */}
            <div className="absolute -inset-4">
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-yellow-400 rounded-full animate-orbit-1 -translate-x-1/2">
                <Star className="w-3 h-3 text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-pink-400 rounded-full animate-orbit-2">
                <Heart className="w-2 h-2 text-white" />
              </div>
              <div className="absolute left-0 top-1/2 w-2 h-2 bg-purple-400 rounded-full animate-orbit-3 -translate-y-1/2">
                <Zap className="w-2 h-2 text-white" />
              </div>
            </div>
          </div>

          {/* Pulsing ring effect */}
          <div className="absolute inset-0 rounded-full border-4 border-begin-teal/20 animate-ping" />
        </div>

        {/* Dynamic message */}
        <div className="mb-4">
          <h3 className={`${classes.text} font-bold text-begin-blue mb-2 animate-fade-in-up`}>
            {childName ? currentMessage.replace('your', `${childName}'s`) : currentMessage}
          </h3>
          
          {/* Fun subtitle */}
          <p className="text-gray-600 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {type === 'assessment' && "This won't take long - we promise it's worth the wait! 🎉"}
            {type === 'profile' && "Great things are about to happen! ✨"}
            {type === 'teacher' && "Your dashboard is getting a magical upgrade! 🌟"}
            {type === 'celebration' && "Something amazing is coming your way! 🎊"}
            {type === 'default' && "Hang tight - magic is happening! ⭐"}
          </p>
        </div>

        {/* Progress bar if enabled */}
        {showProgress && (
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-begin-teal to-begin-cyan rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                {/* Shimmer effect on progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {progress}% complete
            </div>
          </div>
        )}

        {/* Loading dots animation */}
        <div className="flex justify-center space-x-2 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-begin-teal rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Additional mini-loading components for specific use cases
export function LoadingSpinner({ size = 'md', color = 'begin-teal' }: { 
  size?: 'sm' | 'md' | 'lg'
  color?: string 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <div className={`w-full h-full border-2 border-${color}/20 border-t-${color} rounded-full`} />
    </div>
  )
}

export function LoadingPulse({ children, className = '' }: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  )
}

export function LoadingBounce({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-bounce">
      {children}
    </div>
  )
}
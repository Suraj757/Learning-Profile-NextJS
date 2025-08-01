'use client'
import React, { useState, useEffect } from 'react'
import { Sparkles, Star, Trophy, Rocket, Target, Zap } from 'lucide-react'

interface ProgressLoaderProps {
  progress: number
  steps?: string[]
  currentStep?: number
  showSteps?: boolean
  title?: string
  subtitle?: string
  onComplete?: () => void
  autoIncrement?: boolean
  incrementSpeed?: number
}

const defaultSteps = [
  "Getting started... 🚀",
  "Processing responses... 🧠",
  "Analyzing patterns... 🔍",
  "Generating insights... ✨",
  "Creating profile... 🎨",
  "Almost done... 🎯",
  "Complete! 🎉"
]

export default function ProgressLoader({
  progress,
  steps = defaultSteps,
  currentStep = 0,
  showSteps = true,
  title = "Creating Something Amazing",
  subtitle = "This won't take long - we promise it's worth the wait!",
  onComplete,
  autoIncrement = false,
  incrementSpeed = 100
}: ProgressLoaderProps) {
  const [displayProgress, setDisplayProgress] = useState(0)
  const [animationProgress, setAnimationProgress] = useState(0)

  // Smooth progress animation
  useEffect(() => {
    const targetProgress = autoIncrement ? animationProgress : progress
    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev < targetProgress) {
          return Math.min(prev + 1, targetProgress)
        }
        return prev
      })
    }, 20)

    return () => clearInterval(interval)
  }, [autoIncrement ? animationProgress : progress])

  // Auto increment for demo purposes
  useEffect(() => {
    if (autoIncrement) {
      const interval = setInterval(() => {
        setAnimationProgress(prev => {
          if (prev >= 100) {
            onComplete?.()
            return 100
          }
          return prev + 1
        })
      }, incrementSpeed)

      return () => clearInterval(interval)
    }
  }, [autoIncrement, incrementSpeed, onComplete])

  const currentStepIndex = Math.floor((displayProgress / 100) * (steps.length - 1))
  const isComplete = displayProgress >= 100

  return (
    <div className="card-begin p-8 text-center relative overflow-hidden max-w-2xl mx-auto">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-begin-cyan/5 via-begin-teal/5 to-purple-500/5 animate-gradient-shift rounded-card" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="relative mx-auto mb-6 w-20 h-20">
            {isComplete ? (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce-in shadow-lg">
                <Trophy className="h-10 w-10 text-white animate-heartbeat" />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-begin-teal to-begin-cyan rounded-full flex items-center justify-center animate-spin-slow shadow-lg">
                <Sparkles className="h-10 w-10 text-white animate-pulse" />
              </div>
            )}
            
            {/* Orbiting progress indicators */}
            <div className="absolute -inset-2">
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-yellow-400 rounded-full animate-orbit-1 -translate-x-1/2">
                <Star className="w-3 h-3 text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-pink-400 rounded-full animate-orbit-2" />
              <div className="absolute left-0 top-1/2 w-2 h-2 bg-purple-400 rounded-full animate-orbit-3 -translate-y-1/2" />
            </div>
          </div>
          
          <h2 className="text-begin-hero font-bold text-begin-blue mb-2 animate-fade-in-up">
            {isComplete ? "🎉 All Done!" : title}
          </h2>
          <p className="text-begin-body text-gray-600 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {isComplete ? "Your amazing content is ready!" : subtitle}
          </p>
        </div>

        {/* Progress Circle */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - displayProgress / 100)}`}
              className="transition-all duration-500 ease-out"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#007A72" />
                <stop offset="100%" stopColor="#00D1FF" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Progress percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-begin-blue animate-bounce-in">
              {displayProgress}%
            </span>
          </div>
          
          {/* Floating sparkles around progress */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-sparkle"
              style={{
                left: `${20 + (i * 60) % 120}%`,
                top: `${10 + (i * 70) % 80}%`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>

        {/* Progress Bar Alternative */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-begin-teal to-begin-cyan rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${displayProgress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Current Step Display */}
        {showSteps && (
          <div className="mb-6">
            <div className="text-begin-blue font-medium mb-4 animate-fade-in-up">
              {steps[Math.min(currentStepIndex, steps.length - 1)]}
            </div>
            
            {/* Step indicators */}
            <div className="flex justify-center space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentStepIndex
                      ? 'bg-begin-teal animate-pulse'
                      : index === currentStepIndex + 1
                      ? 'bg-begin-teal/50 animate-bounce'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Fun Loading Animation */}
        <div className="flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-begin-teal rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Completion Animation */}
        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full animate-confetti"
                style={{
                  background: ['#007A72', '#00D1FF', '#B1E2FE', '#FFD700', '#FF69B4', '#9370DB'][i % 6],
                  left: `${50 + Math.cos(i * 30 * Math.PI / 180) * 100}%`,
                  top: `${50 + Math.sin(i * 30 * Math.PI / 180) * 100}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Confetti animation keyframes (add this to globals.css if not already there)
/*
@keyframes confetti {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-200px) rotate(720deg); opacity: 0; }
}

.animate-confetti {
  animation: confetti 2s ease-out forwards;
}
*/
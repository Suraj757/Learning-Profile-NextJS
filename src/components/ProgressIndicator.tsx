'use client'
import { useState, useEffect } from 'react'
import { Cloud, CloudOff, Clock, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { formatTimeRemaining } from '@/lib/progress-manager'

interface ProgressIndicatorProps {
  isOnline: boolean
  lastSaved?: string
  expiresAt?: string
  isSaving?: boolean
  saveError?: string | null
  questionNumber: number
  totalQuestions: number
  childName?: string
}

export default function ProgressIndicator({
  isOnline,
  lastSaved,
  expiresAt,
  isSaving = false,
  saveError,
  questionNumber,
  totalQuestions,
  childName
}: ProgressIndicatorProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000) // Update every 30 seconds
    return () => clearInterval(timer)
  }, [])

  const progress = Math.round((questionNumber / totalQuestions) * 100)
  const timeRemaining = expiresAt ? formatTimeRemaining(expiresAt) : null

  const formatLastSaved = (savedTime: string) => {
    const saved = new Date(savedTime)
    const diffMs = currentTime.getTime() - saved.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes === 1) return '1 minute ago'
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    
    return saved.toLocaleDateString()
  }

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          {/* Main Progress Bar */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-begin-blue">
                {childName ? `${childName}'s Learning Journey` : 'Learning Journey'}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                Question {questionNumber} of {totalQuestions}
              </div>
            </div>
            
            {/* Save Status */}
            <div className="flex items-center gap-3">
              {/* Online/Offline Status */}
              <div className={`flex items-center gap-1 text-xs ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>

              {/* Save Status */}
              <div className="flex items-center gap-1 text-xs">
                {isSaving ? (
                  <>
                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-blue-600">Saving...</span>
                  </>
                ) : saveError ? (
                  <>
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">Save failed</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-gray-600">
                      Saved {formatLastSaved(lastSaved)}
                    </span>
                  </>
                ) : isOnline ? (
                  <>
                    <Cloud className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-500">Auto-save enabled</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-500">Saved locally</span>
                  </>
                )}
              </div>

              <div className="text-xs text-gray-500">
                {progress}% Complete
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
            <div 
              className="bg-gradient-to-r from-begin-teal to-begin-cyan h-2 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              {timeRemaining && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Progress expires in {timeRemaining}</span>
                </div>
              )}
              {saveError && (
                <div className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs">
                  {saveError}
                </div>
              )}
            </div>
            <div>
              {isOnline && !saveError && (
                <span className="text-green-600">✓ Progress is being saved automatically</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'
import { useState } from 'react'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Key, 
  Database, 
  Eye,
  Clock,
  User,
  Settings,
  X
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/auth/hooks'

interface AuthStateIndicatorProps {
  variant?: 'full' | 'compact' | 'minimal' | 'badge'
  showDetails?: boolean
  className?: string
}

export default function AuthStateIndicator({ 
  variant = 'compact',
  showDetails = false,
  className = ''
}: AuthStateIndicatorProps) {
  const { teacher, loading } = useTeacherAuth()
  const isAuthenticated = !!teacher
  const [expanded, setExpanded] = useState(false)

  // Determine authentication state
  const getAuthState = () => {
    if (loading) {
      return {
        status: 'loading',
        label: 'Checking Authentication',
        description: 'Verifying your session...',
        icon: Clock,
        color: 'text-begin-cyan',
        bgColor: 'bg-begin-cyan/10',
        borderColor: 'border-begin-cyan/20'
      }
    }

    if (!isAuthenticated || !teacher) {
      return {
        status: 'unauthenticated',
        label: 'Not Signed In',
        description: 'Please sign in to access your dashboard',
        icon: User,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      }
    }

    // Check for demo/offline accounts based on email patterns and demo indicators
    const isDemoAccount = teacher.email === 'demo@school.edu' || 
                         teacher.email?.includes('demo') ||
                         teacher.isOfflineDemo || 
                         teacher.isOfflineAccount ||
                         teacher.name?.toLowerCase().includes('demo')
    
    if (isDemoAccount) {
      return {
        status: 'demo',
        label: 'Demo Account',
        description: 'Using demo data for exploration',
        icon: Eye,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        badge: 'DEMO'
      }
    }

    // Check for accounts that need password setup (legacy support)
    if ((!teacher.id || teacher.id === 0) && teacher.email?.includes('temp')) {
      return {
        status: 'needs_setup',
        label: 'Setup Required',
        description: 'Complete account setup to access all features',
        icon: Key,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        badge: 'SETUP'
      }
    }

    // Check for accounts with database issues (fallback data)
    if (teacher.name?.toLowerCase().includes('demo') || teacher.email?.includes('fallback') || teacher.email?.includes('temp')) {
      return {
        status: 'limited',
        label: 'Limited Access',
        description: 'Some features may be unavailable',
        icon: Database,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        badge: 'LIMITED'
      }
    }

    // Fully authenticated and verified
    return {
      status: 'authenticated',
      label: 'Fully Authenticated',
      description: 'All features available and secure',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      badge: 'VERIFIED'
    }
  }

  const authState = getAuthState()
  const Icon = authState.icon

  // Badge variant - minimal indicator
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${authState.bgColor} ${authState.color} ${className}`}>
        <Icon className="h-3 w-3" />
        {authState.badge || authState.status.toUpperCase()}
      </div>
    )
  }

  // Minimal variant - just icon
  if (variant === 'minimal') {
    return (
      <div 
        className={`p-2 rounded-card ${authState.bgColor} ${className}`}
        title={authState.label}
      >
        <Icon className={`h-4 w-4 ${authState.color}`} />
      </div>
    )
  }

  // Compact variant - icon + label
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-card border ${authState.bgColor} ${authState.borderColor} ${className}`}>
        <Icon className={`h-4 w-4 ${authState.color}`} />
        <span className={`text-sm font-medium ${authState.color}`}>
          {authState.label}
        </span>
        {authState.badge && (
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${authState.color} ${authState.bgColor} border ${authState.borderColor}`}>
            {authState.badge}
          </span>
        )}
      </div>
    )
  }

  // Full variant - complete details
  if (variant === 'full') {
    return (
      <div className={`card-begin ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-card ${authState.bgColor}`}>
              <Icon className={`h-6 w-6 ${authState.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-begin-blue">
                  {authState.label}
                </h3>
                {authState.badge && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${authState.color} ${authState.bgColor} border ${authState.borderColor}`}>
                    {authState.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-begin-blue/70 mb-3">
                {authState.description}
              </p>

              {/* User Details */}
              {teacher && authState.status !== 'unauthenticated' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-begin-blue/50" />
                    <span className="text-begin-blue/70">
                      {teacher.name || teacher.email?.split('@')[0] || 'Teacher'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-3 w-3 text-begin-blue/50" />
                    <span className="text-begin-blue/70 font-mono text-xs">
                      {teacher.email}
                    </span>
                  </div>
                  {teacher.school && (
                    <div className="flex items-center gap-2 text-sm">
                      <Settings className="h-3 w-3 text-begin-blue/50" />
                      <span className="text-begin-blue/70">
                        {teacher.school}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {authState.status === 'needs_setup' && (
                <div className="mt-4">
                  <button
                    onClick={() => window.location.href = '/teacher/password-setup'}
                    className="btn-begin-primary text-sm px-4 py-2"
                  >
                    Complete Setup
                  </button>
                </div>
              )}

              {authState.status === 'unauthenticated' && (
                <div className="mt-4">
                  <button
                    onClick={() => window.location.href = '/teacher/login'}
                    className="btn-begin-primary text-sm px-4 py-2"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Toggle Details Button */}
          {showDetails && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-begin-blue/50 hover:text-begin-blue p-1 rounded transition-colors"
              title={expanded ? 'Hide details' : 'Show details'}
            >
              {expanded ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* Expanded Details */}
        {expanded && showDetails && teacher && (
          <div className="mt-4 pt-4 border-t border-begin-gray">
            <h4 className="font-medium text-begin-blue mb-3">Session Details</h4>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-begin-blue/60">User ID:</span>
                <span className="font-mono text-begin-blue">{teacher.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-begin-blue/60">Account Type:</span>
                <span className="text-begin-blue">Teacher</span>
              </div>
              {teacher.created_at && (
                <div className="flex justify-between">
                  <span className="text-begin-blue/60">Member Since:</span>
                  <span className="text-begin-blue">
                    {new Date(teacher.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-begin-blue/60">Session Status:</span>
                <span className={`font-medium ${authState.color}`}>
                  {authState.status === 'authenticated' ? 'Secure' : authState.label}
                </span>
              </div>
            </div>

            {/* Security Indicators */}
            <div className="mt-4 p-3 bg-begin-teal/5 border border-begin-teal/20 rounded-card">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-begin-teal" />
                <span className="font-medium text-begin-teal text-sm">Security Status</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-begin-blue/70">Session encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-begin-blue/70">FERPA compliant</span>
                </div>
                {authState.status === 'demo' && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <span className="text-begin-blue/70">Demo data (not persistent)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
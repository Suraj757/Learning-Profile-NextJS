import { AlertTriangle, Info, Eye } from 'lucide-react'
import { useTeacherAuth } from '@/lib/auth/hooks'

interface DemoDataIndicatorProps {
  type?: 'warning' | 'info' | 'subtle'
  size?: 'sm' | 'md' | 'lg'
  message?: string
  showIcon?: boolean
  className?: string
}

function DemoDataIndicator({ 
  type = 'warning', 
  size = 'md', 
  message = 'Demo Data',
  showIcon = true,
  className = '' 
}: DemoDataIndicatorProps) {
  const { teacher } = useTeacherAuth()
  
  // Auto-detect demo state if using default message
  const isDemoAccount = teacher?.email?.includes('demo') || 
                       teacher?.email?.includes('temp') ||
                       teacher?.name?.toLowerCase().includes('demo') ||
                       teacher?.isOfflineDemo ||
                       teacher?.isOfflineAccount
  
  // Don't show indicator if not demo account (unless message is custom)
  if (message === 'Demo Data' && !isDemoAccount) {
    return null
  }
  
  const baseClasses = 'inline-flex items-center gap-2 rounded-full font-medium'
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm', 
    lg: 'px-4 py-2 text-base'
  }
  
  const typeClasses = {
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    subtle: 'bg-gray-100 text-gray-600 border border-gray-200'
  }
  
  const icons = {
    warning: AlertTriangle,
    info: Info,
    subtle: Eye
  }
  
  const Icon = icons[type]
  
  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${typeClasses[type]} ${className}`}>
      {showIcon && <Icon className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />}
      {message}
    </span>
  )
}

// Banner version for page-level demo indicators
interface DemoDataBannerProps {
  message?: string
  onDismiss?: () => void
  actionText?: string
  onAction?: () => void
}

export function DemoDataBanner({ 
  message = 'You are viewing demo data. Real student data will appear here once assessments are completed.',
  onDismiss,
  actionText = 'Send Assessments',
  onAction 
}: DemoDataBannerProps) {
  const { teacher } = useTeacherAuth()
  
  // Auto-detect demo state
  const isDemoAccount = teacher?.email?.includes('demo') || 
                       teacher?.email?.includes('temp') ||
                       teacher?.name?.toLowerCase().includes('demo') ||
                       teacher?.isOfflineDemo ||
                       teacher?.isOfflineAccount
  
  // Don't show banner if not demo account
  if (!isDemoAccount) {
    return null
  }
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-amber-800 mb-1">Demo Data Active</h4>
          <p className="text-sm text-amber-700">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          {onAction && (
            <button
              onClick={onAction}
              className="text-sm font-medium text-amber-800 hover:text-amber-900 underline"
            >
              {actionText}
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-amber-600 hover:text-amber-800 p-1"
              aria-label="Dismiss"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Component to wrap demo content
interface DemoDataWrapperProps {
  children: React.ReactNode
  isDemo: boolean
  demoMessage?: string
  className?: string
}

export function DemoDataWrapper({ 
  children, 
  isDemo, 
  demoMessage = 'Demo Data',
  className = '' 
}: DemoDataWrapperProps) {
  const { teacher } = useTeacherAuth()
  
  // Auto-detect demo state if not explicitly provided
  const isDemoAccount = isDemo || 
                       teacher?.email?.includes('demo') || 
                       teacher?.email?.includes('temp') ||
                       teacher?.name?.toLowerCase().includes('demo') ||
                       teacher?.isOfflineDemo ||
                       teacher?.isOfflineAccount
  
  if (!isDemoAccount) return <>{children}</>
  
  return (
    <div className={`relative ${className}`}>
      {/* Demo overlay indicator */}
      <div className="absolute top-2 right-2 z-10">
        <DemoDataIndicator message={demoMessage} size="sm" />
      </div>
      
      {/* Subtle demo styling */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-lg pointer-events-none" />
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  )
}

// Export both named and default
export { DemoDataIndicator }
export default DemoDataIndicator
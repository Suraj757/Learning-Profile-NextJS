'use client'
import Link from 'next/link'
import { BookOpen, Bell, HelpCircle } from 'lucide-react'
import { useTeacherAuth } from '@/lib/auth/hooks'
import LogoutButton from './LogoutButton'
import AuthStateIndicator from './AuthStateIndicator'

interface AuthenticatedHeaderProps {
  title?: string
  subtitle?: string
  showAuthState?: boolean
  showNotifications?: boolean
  className?: string
}

export default function AuthenticatedHeader({
  title = "Teacher Dashboard",
  subtitle,
  showAuthState = true,
  showNotifications = true,
  className = ''
}: AuthenticatedHeaderProps) {
  const { teacher, loading } = useTeacherAuth()
  const isAuthenticated = !!teacher

  // Don't render if not authenticated or still loading
  if (loading || !isAuthenticated || !teacher) {
    return (
      <header className={`bg-white shadow-sm border-b border-begin-gray ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <div>
                <span className="text-2xl font-bold text-begin-blue">{title}</span>
                <div className="h-4 bg-gray-200 rounded w-32 mt-1 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={`bg-white shadow-sm border-b border-begin-gray ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Left Side - Logo & Title */}
          <div className="flex items-center space-x-4">
            <Link href="/teacher/dashboard" className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <div>
                <span className="text-2xl font-bold text-begin-blue">{title}</span>
                <p className="text-sm text-begin-blue/70">
                  {subtitle || `Welcome back, ${teacher.name || teacher.email?.split('@')[0]}`}
                </p>
              </div>
            </Link>

            {/* Auth State Indicator */}
            {showAuthState && (
              <div className="hidden lg:block">
                <AuthStateIndicator variant="badge" />
              </div>
            )}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Auth State */}
            {showAuthState && (
              <div className="lg:hidden">
                <AuthStateIndicator variant="minimal" />
              </div>
            )}

            {/* Notifications */}
            {showNotifications && (
              <button
                className="p-2 text-begin-blue/70 hover:text-begin-teal transition-colors rounded-card hover:bg-begin-cream/50"
                title="Notifications"
              >
                <Bell className="h-6 w-6" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  2
                </span>
              </button>
            )}

            {/* Help */}
            <Link 
              href="/teacher/help"
              className="p-2 text-begin-blue/70 hover:text-begin-teal transition-colors rounded-card hover:bg-begin-cream/50"
              title="Help & Support"
            >
              <HelpCircle className="h-6 w-6" />
            </Link>

            {/* User Menu / Logout */}
            <div className="hidden md:block">
              <LogoutButton variant="menu" />
            </div>

            {/* Mobile Logout */}
            <div className="md:hidden">
              <LogoutButton variant="icon" />
            </div>

            {/* Home Link */}
            <Link 
              href="/"
              className="text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors text-sm px-3 py-2 rounded-card hover:bg-begin-teal/5"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Mobile Auth State Details (Below main header on mobile) */}
        {showAuthState && (
          <div className="lg:hidden mt-4 pt-4 border-t border-begin-gray">
            <AuthStateIndicator variant="compact" />
          </div>
        )}
      </div>
    </header>
  )
}
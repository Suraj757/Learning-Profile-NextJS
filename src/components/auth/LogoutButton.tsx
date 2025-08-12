'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Settings, Shield, ChevronDown } from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'

interface LogoutButtonProps {
  variant?: 'button' | 'menu' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  showConfirmDialog?: boolean
  className?: string
}

export default function LogoutButton({ 
  variant = 'button', 
  size = 'md',
  showConfirmDialog = true,
  className = ''
}: LogoutButtonProps) {
  const { teacher, logout } = useTeacherAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    if (showConfirmDialog && !showConfirm) {
      setShowConfirm(true)
      return
    }

    try {
      setIsLoading(true)
      
      // Call logout API to clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      // Clear client-side state
      logout()
      
      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Still proceed with client-side logout
      logout()
      router.push('/')
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
    setShowMenu(false)
  }

  // Simple button variant
  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className={`
            inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
            transition-all duration-200 rounded-card
            ${size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'}
            ${isLoading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white border border-begin-gray text-begin-blue hover:bg-red-50 hover:border-red-200 hover:text-red-700'
            }
            ${className}
          `}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {isLoading ? 'Signing Out...' : 'Sign Out'}
        </button>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-card p-6 max-w-sm w-full shadow-xl">
              <div className="text-center">
                <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-heading font-bold text-begin-blue mb-2">
                  Sign Out?
                </h3>
                <p className="text-sm text-begin-blue/70 mb-6">
                  You'll need to sign in again to access your dashboard.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 text-sm font-medium text-begin-blue border border-begin-gray rounded-card hover:bg-begin-cream/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-card hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Signing Out...' : 'Sign Out'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`
          p-2 rounded-card transition-colors
          ${isLoading 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-begin-blue/70 hover:text-red-600 hover:bg-red-50'
          }
          ${className}
        `}
        title="Sign Out"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
        ) : (
          <LogOut className="h-5 w-5" />
        )}
      </button>
    )
  }

  // Dropdown menu variant
  if (variant === 'menu') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`
            flex items-center gap-2 px-3 py-2 text-sm font-medium
            text-begin-blue hover:bg-begin-cream/50 rounded-card transition-colors
            ${className}
          `}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-begin-teal to-begin-cyan rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {teacher?.name ? teacher.name.charAt(0).toUpperCase() : teacher?.email?.charAt(0).toUpperCase() || 'T'}
          </div>
          <span className="hidden md:inline truncate max-w-32">
            {teacher?.name || teacher?.email?.split('@')[0] || 'Teacher'}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-card shadow-lg border border-begin-gray z-20">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-begin-gray">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-begin-teal to-begin-cyan rounded-full flex items-center justify-center text-white font-semibold">
                    {teacher?.name ? teacher.name.charAt(0).toUpperCase() : teacher?.email?.charAt(0).toUpperCase() || 'T'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-begin-blue truncate">
                      {teacher?.name || 'Teacher'}
                    </p>
                    <p className="text-xs text-begin-blue/60 truncate">
                      {teacher?.email}
                    </p>
                    {teacher?.school && (
                      <p className="text-xs text-begin-blue/50 truncate">
                        {teacher.school}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    router.push('/teacher/profile')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-begin-blue hover:bg-begin-cream/50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  View Profile
                </button>
                
                <button
                  onClick={() => {
                    setShowMenu(false)
                    router.push('/teacher/settings')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-begin-blue hover:bg-begin-cream/50 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false)
                    router.push('/teacher/privacy')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-begin-blue hover:bg-begin-cream/50 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Privacy & Data
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-begin-gray py-2">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    handleLogout()
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  {isLoading ? 'Signing Out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Confirmation Dialog for Menu */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-card p-6 max-w-sm w-full shadow-xl">
              <div className="text-center">
                <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-heading font-bold text-begin-blue mb-2">
                  Sign Out?
                </h3>
                <p className="text-sm text-begin-blue/70 mb-6">
                  You'll need to sign in again to access your dashboard.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 text-sm font-medium text-begin-blue border border-begin-gray rounded-card hover:bg-begin-cream/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-card hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Signing Out...' : 'Sign Out'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
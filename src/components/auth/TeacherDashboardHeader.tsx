'use client'
import Link from 'next/link'
import { BookOpen, Settings, Bell } from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import LogoutButton from './LogoutButton'
import AuthStateIndicator from './AuthStateIndicator'

interface TeacherDashboardHeaderProps {
  className?: string
}

/**
 * Enhanced Teacher Dashboard Header with Authentication Components
 * 
 * This component demonstrates how to integrate the new auth components
 * into the existing dashboard header pattern.
 */
export default function TeacherDashboardHeader({ 
  className = '' 
}: TeacherDashboardHeaderProps) {
  const { teacher, loading } = useTeacherAuth()

  if (loading) {
    return (
      <header className={`bg-white shadow-sm border-b border-begin-gray ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <div>
                <span className="text-2xl font-bold text-begin-blue">Teacher Dashboard</span>
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
          {/* Left Side - Logo, Title & Auth Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <div>
                <span className="text-2xl font-bold text-begin-blue">Teacher Dashboard</span>
                <p className="text-sm text-begin-blue/70">
                  Welcome back, {teacher?.name || teacher?.email?.split('@')[0] || 'Teacher'}
                </p>
              </div>
            </div>

            {/* Auth Status Indicator (Desktop) */}
            <div className="hidden xl:block">
              <AuthStateIndicator variant="compact" />
            </div>
          </div>

          {/* Right Side - Actions & User Menu */}
          <div className="flex items-center space-x-3">
            {/* Mobile Auth Status */}
            <div className="xl:hidden">
              <AuthStateIndicator variant="badge" />
            </div>

            {/* Notifications (with demo badge) */}
            <div className="relative">
              <button
                className="p-2 text-begin-blue/70 hover:text-begin-teal transition-colors rounded-card hover:bg-begin-cream/50"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
              {/* Demo notification badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
            </div>

            {/* Settings Link */}
            <Link 
              href="/teacher/settings"
              className="p-2 text-begin-blue/70 hover:text-begin-teal transition-colors rounded-card hover:bg-begin-cream/50"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>

            {/* User Menu (Desktop) */}
            <div className="hidden md:block">
              <LogoutButton variant="menu" showConfirmDialog={true} />
            </div>

            {/* Quick Logout (Mobile) */}
            <div className="md:hidden">
              <LogoutButton variant="icon" showConfirmDialog={true} />
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

        {/* Mobile Auth State Details */}
        <div className="xl:hidden mt-4 pt-4 border-t border-begin-gray">
          <div className="flex items-center justify-between">
            <AuthStateIndicator variant="compact" />
            
            {/* Quick action buttons for mobile */}
            <div className="flex items-center gap-2">
              <Link
                href="/teacher/classroom/create"
                className="text-xs bg-begin-teal text-white px-3 py-1 rounded-card hover:bg-begin-teal-hover transition-colors"
              >
                Create Classroom
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
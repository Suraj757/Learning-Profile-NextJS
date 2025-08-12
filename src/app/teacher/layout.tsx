'use client'
import React from 'react'
import { SecureAuthProvider } from '@/lib/auth/hooks'
import { PerformanceMonitor } from '@/components/optimized/PerformanceMonitor'

/**
 * Teacher Application Layout
 * 
 * This layout provides:
 * - Secure authentication context for all teacher pages
 * - Performance monitoring for teacher dashboard
 * - Educational compliance framework
 */
export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SecureAuthProvider>
      <PerformanceMonitor 
        threshold={2000}
        reportingEnabled={process.env.NODE_ENV === 'production'}
      >
        {children}
      </PerformanceMonitor>
    </SecureAuthProvider>
  )
}
'use client'
import React from 'react'
import { PerformanceMonitor } from '@/components/optimized/PerformanceMonitor'

/**
 * Teacher Application Layout
 * 
 * This layout provides:
 * - Performance monitoring for teacher dashboard
 * - Educational compliance framework
 * 
 * Note: Authentication is handled individually by each page using useTeacherAuth
 */
export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <PerformanceMonitor 
        enabled={process.env.NODE_ENV === 'development'}
        showDebugInfo={process.env.NODE_ENV === 'development'}
      />
    </>
  )
}
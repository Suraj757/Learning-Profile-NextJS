'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-begin-blue" />
              <span className="text-2xl font-bold text-begin-blue">Begin Learning Profile</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full mx-4">
          <div className="card-begin p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-begin-hero font-bold text-begin-blue mb-4">
              Unable to Load Profile
            </h1>
            
            <p className="text-begin-body text-gray-600 mb-6">
              We encountered an error while loading the learning profile. This could be due to an invalid profile ID or a temporary issue.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={reset}
                className="btn-begin-primary w-full flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              
              <Link
                href="/assessment/start"
                className="btn-begin-secondary w-full flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Create New Profile</span>
              </Link>
              
              <Link
                href="/"
                className="text-begin-body text-gray-600 hover:text-begin-blue transition-colors inline-block"
              >
                Go to Homepage
              </Link>
            </div>
            
            {error.digest && (
              <p className="text-xs text-gray-400 mt-6">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
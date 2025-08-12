'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import PasswordSetupFlow from '@/components/auth/PasswordSetupFlow'


function PasswordSetupForm() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const userId = searchParams.get('userId') || ''

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-begin-teal to-begin-blue flex items-center justify-center">
        <div className="card-begin p-8 max-w-md mx-4">
          <h2 className="text-2xl font-bold text-begin-blue mb-4">Invalid Link</h2>
          <p className="text-gray-600 mb-6">
            This password setup link is invalid or expired. Please request a new one.
          </p>
          <Link 
            href="/auth/login"
            className="btn-begin-primary w-full text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-begin-teal to-begin-blue">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-begin-blue" />
              <span className="text-2xl font-bold text-begin-blue">Begin Learning Profile</span>
            </Link>
            <Link 
              href="/auth/login"
              className="text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Use the enhanced PasswordSetupFlow component */}
        <PasswordSetupFlow 
          email={email}
          userId={userId}
          mode="setup"
          className="w-full max-w-md"
        />
      </div>
    </div>
  )
}

export default function PasswordSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-begin-teal to-begin-blue flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <PasswordSetupForm />
    </Suspense>
  )
}
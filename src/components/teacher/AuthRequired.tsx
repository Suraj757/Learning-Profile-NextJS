'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTeacherAuth } from '@/lib/teacher-auth'
import { BookOpen, School } from 'lucide-react'

interface AuthRequiredProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthRequired({ children, fallback }: AuthRequiredProps) {
  const { teacher, loading, isAuthenticated, login } = useTeacherAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Give a short delay to avoid jarring redirect
      const timer = setTimeout(() => {
        router.push('/teacher/register')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-begin-blue">Loading teacher dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-begin-cream">
        <header className="bg-white shadow-sm border-b border-begin-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-begin-teal" />
                <span className="text-2xl font-bold text-begin-blue">Teacher Access Required</span>
              </div>
              <Link 
                href="/"
                className="text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card-begin p-8 text-center">
            <div className="bg-begin-teal/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <School className="h-10 w-10 text-begin-teal" />
            </div>
            <h1 className="text-2xl font-bold text-begin-blue mb-4">
              Teacher Login Required
            </h1>
            <p className="text-begin-blue/70 mb-6">
              You need to be logged in as a teacher to access this page.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={async () => {
                  try {
                    // Import the Supabase functions
                    const { getTeacherByEmail, createTeacher } = await import('@/lib/supabase')
                    
                    // Try to create or get demo teacher from database
                    let demoTeacher
                    const existingDemo = await getTeacherByEmail('demo@school.edu')
                    
                    if (existingDemo) {
                      demoTeacher = existingDemo
                    } else {
                      // Create demo teacher in database
                      demoTeacher = await createTeacher({
                        email: 'demo@school.edu',
                        name: 'Demo Teacher',
                        school: 'Demo Elementary School',
                        grade_level: '3rd Grade'
                      })
                    }
                    
                    login(demoTeacher)
                    // Don't redirect here, let the auth effect handle it
                  } catch (error) {
                    console.error('Demo teacher creation failed:', error)
                    // Fallback to offline demo
                    const offlineDemoTeacher = {
                      id: 999999,
                      name: 'Demo Teacher (Offline)',
                      email: 'demo@offline.local',
                      school: 'Demo Elementary School',
                      grade_level: '3rd Grade',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      isOfflineDemo: true
                    }
                    login(offlineDemoTeacher)
                  }
                }}
                className="btn-begin-primary px-8 py-3 font-bold"
              >
                🎯 Try Demo Teacher Account
              </button>
              
              <div className="text-center">
                <Link
                  href="/teacher/register"
                  className="btn-begin-secondary px-6 py-2"
                >
                  Go to Teacher Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
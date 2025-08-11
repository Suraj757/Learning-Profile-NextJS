'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowRight, Users, GraduationCap, Play, Clock } from 'lucide-react'

export default function TeacherDemoPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLaunchDemo = async () => {
    setLoading(true)
    
    try {
      // Simulate demo setup time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For now, redirect to the registration page with a demo flag
      // Later you can implement an actual demo dashboard
      router.push('/teacher/dashboard?demo=true')
      
    } catch (error) {
      console.error('Demo launch failed:', error)
      // Fallback to login page
      router.push('/teacher/login?demo=true')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-begin-blue" />
              <span className="text-2xl font-bold text-begin-blue">Begin Learning Profile</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/teacher/login"
                className="text-begin-teal hover:text-begin-teal-hover font-semibold transition-colors"
              >
                Teacher Sign In
              </Link>
              <Link 
                href="/teacher/register"
                className="btn-begin-secondary text-sm py-2 px-4"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-begin p-8 lg:p-12">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="bg-begin-teal/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-10 w-10 text-begin-teal" />
            </div>
            <h1 className="text-hero font-bold text-begin-blue mb-4">
              Teacher Dashboard Demo
            </h1>
            <p className="text-body-lg text-begin-blue/80 max-w-2xl mx-auto mb-6">
              Explore all the features teachers love with sample student data. See how learning profiles transform your classroom management.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-begin-blue/70 mb-8">
              <Clock className="h-4 w-4" />
              <span>Demo takes 2-3 minutes to explore</span>
            </div>
          </div>

          {/* Demo Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="text-center p-6 bg-begin-blue/5 rounded-card">
              <div className="bg-begin-blue/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-begin-blue" />
              </div>
              <h3 className="font-semibold text-begin-blue mb-2">Sample Classroom</h3>
              <p className="text-sm text-begin-blue/70">24 diverse student profiles with different learning styles</p>
            </div>
            
            <div className="text-center p-6 bg-begin-teal/5 rounded-card">
              <div className="bg-begin-teal/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-begin-teal" />
              </div>
              <h3 className="font-semibold text-begin-teal mb-2">Learning Insights</h3>
              <p className="text-sm text-begin-blue/70">See how profiles translate to teaching strategies</p>
            </div>
            
            <div className="text-center p-6 bg-begin-cyan/10 rounded-card">
              <div className="bg-begin-cyan/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-6 w-6 text-begin-cyan" />
              </div>
              <h3 className="font-semibold text-begin-cyan mb-2">Parent Communication</h3>
              <p className="text-sm text-begin-blue/70">Tools for sharing insights with families</p>
            </div>
          </div>

          {/* What You'll See Section */}
          <div className="bg-gradient-to-r from-begin-teal/5 to-begin-cyan/5 rounded-card p-8 mb-8">
            <h3 className="text-heading-lg font-bold text-begin-blue mb-4 text-center">What You'll Experience</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-begin-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="font-semibold text-begin-blue">Classroom Overview</h4>
                    <p className="text-sm text-begin-blue/70">See all student learning profiles at a glance</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="bg-begin-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="font-semibold text-begin-blue">Individual Student Details</h4>
                    <p className="text-sm text-begin-blue/70">Deep dive into specific learning preferences</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="bg-begin-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="font-semibold text-begin-blue">Assessment Management</h4>
                    <p className="text-sm text-begin-blue/70">Track which families have completed profiles</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-begin-cyan text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                  <div>
                    <h4 className="font-semibold text-begin-blue">Teaching Strategies</h4>
                    <p className="text-sm text-begin-blue/70">Get specific classroom techniques for each profile</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="bg-begin-cyan text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</span>
                  <div>
                    <h4 className="font-semibold text-begin-blue">Parent Communication Tools</h4>
                    <p className="text-sm text-begin-blue/70">Templates and insights for family conversations</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="bg-begin-cyan text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">6</span>
                  <div>
                    <h4 className="font-semibold text-begin-blue">Classroom Analytics</h4>
                    <p className="text-sm text-begin-blue/70">Understand your class's learning style distribution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Launch Demo Button */}
          <div className="text-center">
            <button
              onClick={handleLaunchDemo}
              disabled={loading}
              className="btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto mb-6"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Preparing Demo...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Launch Teacher Demo
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
            
            <p className="text-sm text-begin-blue/60 mb-6">
              No signup required • Sample data only • Full feature access
            </p>
          </div>

          {/* Ready for Real Account */}
          <div className="text-center pt-6 border-t border-begin-gray">
            <p className="text-sm text-begin-blue/70 mb-4">
              Ready to create your real teacher account?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/teacher/register"
                className="btn-begin-secondary"
              >
                Create Free Account
              </Link>
              <Link 
                href="/teacher/login"
                className="text-begin-teal hover:text-begin-teal-hover font-semibold text-sm transition-colors flex items-center justify-center"
              >
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
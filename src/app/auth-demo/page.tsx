'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  Shield, 
  Key, 
  Eye, 
  User, 
  Settings,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

// Import our auth components
import LogoutButton from '@/components/auth/LogoutButton'
import AuthStateIndicator from '@/components/auth/AuthStateIndicator'
import PasswordSetupFlow from '@/components/auth/PasswordSetupFlow'
import AuthenticatedHeader from '@/components/auth/AuthenticatedHeader'
import { DemoDataIndicator, DemoDataBanner, DemoDataWrapper } from '@/components/ui/DemoDataIndicator'

/**
 * Authentication Components Demo Page
 * 
 * This page demonstrates all the new authentication UI components
 * and shows how they integrate with the existing design system.
 */
export default function AuthDemoPage() {
  const [currentDemo, setCurrentDemo] = useState<string>('overview')
  const [demoSettings, setDemoSettings] = useState({
    authState: 'authenticated' as 'authenticated' | 'demo' | 'unauthenticated' | 'needs_setup',
    showDemoData: true,
    headerVariant: 'full' as 'full' | 'compact'
  })

  const demos = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'logout', label: 'Logout Button', icon: User },
    { id: 'auth-state', label: 'Auth State Indicator', icon: Shield },
    { id: 'password-setup', label: 'Password Setup', icon: Key },
    { id: 'header', label: 'Authenticated Header', icon: Settings },
    { id: 'demo-indicators', label: 'Demo Data Indicators', icon: Eye },
    { id: 'integration', label: 'Full Integration', icon: CheckCircle }
  ]

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-begin-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <div>
                <h1 className="text-2xl font-bold text-begin-blue">Authentication Components Demo</h1>
                <p className="text-sm text-begin-blue/70">Interactive showcase of auth UI components</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/teacher/dashboard"
                className="text-begin-teal hover:text-begin-teal-hover font-medium"
              >
                Teacher Dashboard
              </Link>
              <Link 
                href="/"
                className="text-begin-blue hover:text-begin-cyan font-medium"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card-begin p-6 sticky top-8">
              <h2 className="font-bold text-begin-blue mb-4">Components</h2>
              <nav className="space-y-2">
                {demos.map((demo) => {
                  const Icon = demo.icon
                  return (
                    <button
                      key={demo.id}
                      onClick={() => setCurrentDemo(demo.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-card text-left transition-colors ${
                        currentDemo === demo.id
                          ? 'bg-begin-teal text-white'
                          : 'text-begin-blue hover:bg-begin-cream/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {demo.label}
                    </button>
                  )
                })}
              </nav>

              {/* Demo Settings */}
              <div className="mt-8 pt-6 border-t border-begin-gray">
                <h3 className="font-semibold text-begin-blue mb-3">Demo Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-begin-blue mb-2">
                      Auth State
                    </label>
                    <select
                      value={demoSettings.authState}
                      onChange={(e) => setDemoSettings(prev => ({ 
                        ...prev, 
                        authState: e.target.value as any 
                      }))}
                      className="w-full text-sm border border-begin-gray rounded-card px-2 py-1"
                    >
                      <option value="authenticated">Authenticated</option>
                      <option value="demo">Demo Account</option>
                      <option value="unauthenticated">Unauthenticated</option>
                      <option value="needs_setup">Needs Setup</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={demoSettings.showDemoData}
                        onChange={(e) => setDemoSettings(prev => ({ 
                          ...prev, 
                          showDemoData: e.target.checked 
                        }))}
                        className="rounded"
                      />
                      Show Demo Data
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card-begin p-8">
              {/* Overview */}
              {currentDemo === 'overview' && (
                <div>
                  <h2 className="text-heading-lg font-bold text-begin-blue mb-6">
                    Authentication Components Overview
                  </h2>
                  
                  <div className="prose prose-begin max-w-none">
                    <p className="text-body text-begin-blue/80 mb-6">
                      These components implement a comprehensive authentication system with 
                      educational compliance, demo data awareness, and mobile-responsive design.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-begin-teal/5 border border-begin-teal/20 rounded-card p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Shield className="h-5 w-5 text-begin-teal" />
                          <h3 className="font-semibold text-begin-teal">Security First</h3>
                        </div>
                        <ul className="text-sm text-begin-blue/70 space-y-1">
                          <li>• FERPA compliant authentication</li>
                          <li>• Secure session management</li>
                          <li>• Role-based access control</li>
                          <li>• Audit logging for compliance</li>
                        </ul>
                      </div>

                      <div className="bg-begin-cyan/5 border border-begin-cyan/20 rounded-card p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Eye className="h-5 w-5 text-begin-cyan" />
                          <h3 className="font-semibold text-begin-cyan">Demo Awareness</h3>
                        </div>
                        <ul className="text-sm text-begin-blue/70 space-y-1">
                          <li>• Auto-detects demo accounts</li>
                          <li>• Clear demo data indicators</li>
                          <li>• Seamless real data transition</li>
                          <li>• UX research recommendations</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-begin-teal/10 to-begin-cyan/10 border border-begin-teal/20 rounded-card p-6">
                      <h3 className="font-semibold text-begin-blue mb-3">Key Features</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium text-begin-teal mb-2">User Experience</h4>
                          <ul className="text-begin-blue/70 space-y-1">
                            <li>• Simplified password requirements</li>
                            <li>• Clear visual feedback</li>
                            <li>• Mobile-responsive design</li>
                            <li>• Accessible for all users</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-begin-teal mb-2">Integration</h4>
                          <ul className="text-begin-blue/70 space-y-1">
                            <li>• Works with existing patterns</li>
                            <li>• TypeScript support</li>
                            <li>• Consistent styling</li>
                            <li>• Easy to customize</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Logout Button Demo */}
              {currentDemo === 'logout' && (
                <div>
                  <h2 className="text-heading-lg font-bold text-begin-blue mb-6">
                    Logout Button Component
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-begin-blue mb-3">Variants</h3>
                      <div className="grid gap-4">
                        <div className="flex flex-wrap items-center gap-4 p-4 bg-begin-cream/30 rounded-card">
                          <span className="text-sm font-medium text-begin-blue">Button:</span>
                          <LogoutButton variant="button" size="sm" showConfirmDialog={false} />
                          <LogoutButton variant="button" size="md" showConfirmDialog={false} />
                          <LogoutButton variant="button" size="lg" showConfirmDialog={false} />
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 bg-begin-cream/30 rounded-card">
                          <span className="text-sm font-medium text-begin-blue">Icon:</span>
                          <LogoutButton variant="icon" showConfirmDialog={false} />
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 bg-begin-cream/30 rounded-card">
                          <span className="text-sm font-medium text-begin-blue">Menu:</span>
                          <LogoutButton variant="menu" showConfirmDialog={false} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-begin-blue/5 border border-begin-blue/20 rounded-card p-4">
                      <h4 className="font-medium text-begin-blue mb-2">Features</h4>
                      <ul className="text-sm text-begin-blue/70 space-y-1">
                        <li>• Multiple display variants (button, icon, dropdown menu)</li>
                        <li>• Configurable confirmation dialog</li>
                        <li>• Loading states with visual feedback</li>
                        <li>• Secure logout with session cleanup</li>
                        <li>• Mobile-responsive design</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Auth State Indicator Demo */}
              {currentDemo === 'auth-state' && (
                <div>
                  <h2 className="text-heading-lg font-bold text-begin-blue mb-6">
                    Auth State Indicator
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-begin-blue mb-3">Variants</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-begin-cream/30 rounded-card">
                          <span className="text-sm font-medium text-begin-blue block mb-3">Badge:</span>
                          <AuthStateIndicator variant="badge" />
                        </div>
                        
                        <div className="p-4 bg-begin-cream/30 rounded-card">
                          <span className="text-sm font-medium text-begin-blue block mb-3">Minimal:</span>
                          <AuthStateIndicator variant="minimal" />
                        </div>
                        
                        <div className="p-4 bg-begin-cream/30 rounded-card">
                          <span className="text-sm font-medium text-begin-blue block mb-3">Compact:</span>
                          <AuthStateIndicator variant="compact" />
                        </div>
                        
                        <div className="p-4 bg-begin-cream/30 rounded-card">
                          <span className="text-sm font-medium text-begin-blue block mb-3">Full:</span>
                          <AuthStateIndicator variant="full" showDetails={true} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-begin-teal/5 border border-begin-teal/20 rounded-card p-4">
                      <h4 className="font-medium text-begin-teal mb-2">Auto-Detection</h4>
                      <p className="text-sm text-begin-blue/70 mb-3">
                        The component automatically detects and displays:
                      </p>
                      <ul className="text-sm text-begin-blue/70 space-y-1">
                        <li>• Demo vs real account status</li>
                        <li>• Authentication state</li>
                        <li>• Password setup requirements</li>
                        <li>• Session security status</li>
                        <li>• FERPA compliance indicators</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Setup Demo */}
              {currentDemo === 'password-setup' && (
                <div>
                  <h2 className="text-heading-lg font-bold text-begin-blue mb-6">
                    Password Setup Flow
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-card p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-800 mb-1">Demo Mode</h4>
                          <p className="text-sm text-amber-700">
                            This is a demo of the password setup component. In production, 
                            it would be accessed via secure email links.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-begin-gray rounded-card p-1">
                      <PasswordSetupFlow
                        email="demo@teacher.edu"
                        mode="setup"
                        onComplete={() => alert('Password setup completed!')}
                        className=""
                      />
                    </div>

                    <div className="bg-begin-teal/5 border border-begin-teal/20 rounded-card p-4">
                      <h4 className="font-medium text-begin-teal mb-2">Enhanced UX Features</h4>
                      <ul className="text-sm text-begin-blue/70 space-y-1">
                        <li>• Real-time password strength validation</li>
                        <li>• Clear visual requirements checklist</li>
                        <li>• Simplified password complexity rules</li>
                        <li>• Accessible form design</li>
                        <li>• FERPA compliance messaging</li>
                        <li>• Success state with clear next steps</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Header Demo */}
              {currentDemo === 'header' && (
                <div>
                  <h2 className="text-heading-lg font-bold text-begin-blue mb-6">
                    Authenticated Header
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="border border-begin-gray rounded-card overflow-hidden">
                      <AuthenticatedHeader
                        title="Teacher Dashboard"
                        subtitle="Welcome back, Demo Teacher"
                        showAuthState={true}
                        showNotifications={true}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-begin-blue/5 border border-begin-blue/20 rounded-card p-4">
                        <h4 className="font-medium text-begin-blue mb-2">Features</h4>
                        <ul className="text-sm text-begin-blue/70 space-y-1">
                          <li>• Integrated auth state indicator</li>
                          <li>• User menu with profile options</li>
                          <li>• Notification system ready</li>
                          <li>• Mobile-responsive design</li>
                          <li>• Consistent branding</li>
                        </ul>
                      </div>

                      <div className="bg-begin-cyan/5 border border-begin-cyan/20 rounded-card p-4">
                        <h4 className="font-medium text-begin-cyan mb-2">Responsive Behavior</h4>
                        <ul className="text-sm text-begin-blue/70 space-y-1">
                          <li>• Desktop: Full auth state display</li>
                          <li>• Tablet: Compact indicators</li>
                          <li>• Mobile: Minimal badges</li>
                          <li>• Touch-friendly interactions</li>
                          <li>• Accessible navigation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Demo Data Indicators */}
              {currentDemo === 'demo-indicators' && (
                <div>
                  <h2 className="text-heading-lg font-bold text-begin-blue mb-6">
                    Demo Data Indicators
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Banner */}
                    <div>
                      <h3 className="font-semibold text-begin-blue mb-3">Demo Data Banner</h3>
                      <DemoDataBanner 
                        message="You are viewing demo data to explore the platform features."
                        actionText="Create Real Assessment"
                        onAction={() => alert('Navigate to assessment creation')}
                      />
                    </div>

                    {/* Indicators */}
                    <div>
                      <h3 className="font-semibold text-begin-blue mb-3">Indicator Variants</h3>
                      <div className="flex flex-wrap gap-4 p-4 bg-begin-cream/30 rounded-card">
                        <DemoDataIndicator type="warning" size="sm" />
                        <DemoDataIndicator type="info" size="md" />
                        <DemoDataIndicator type="subtle" size="lg" />
                      </div>
                    </div>

                    {/* Wrapper */}
                    <div>
                      <h3 className="font-semibold text-begin-blue mb-3">Demo Data Wrapper</h3>
                      <DemoDataWrapper isDemo={true} demoMessage="Sample Data">
                        <div className="bg-white border border-begin-gray rounded-card p-6">
                          <h4 className="font-semibold text-begin-blue mb-2">Student Profile</h4>
                          <p className="text-begin-blue/70">This would be real student data in production.</p>
                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="bg-begin-teal/10 p-3 rounded">
                              <div className="text-sm text-begin-teal font-medium">Learning Style</div>
                              <div className="text-begin-blue">Visual Learner</div>
                            </div>
                            <div className="bg-begin-cyan/10 p-3 rounded">
                              <div className="text-sm text-begin-cyan font-medium">Engagement</div>
                              <div className="text-begin-blue">High Energy</div>
                            </div>
                          </div>
                        </div>
                      </DemoDataWrapper>
                    </div>

                    <div className="bg-begin-teal/5 border border-begin-teal/20 rounded-card p-4">
                      <h4 className="font-medium text-begin-teal mb-2">Smart Detection</h4>
                      <p className="text-sm text-begin-blue/70">
                        Demo data indicators automatically detect demo accounts and show appropriate 
                        messaging without requiring manual configuration.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Integration */}
              {currentDemo === 'integration' && (
                <div>
                  <h2 className="text-heading-lg font-bold text-begin-blue mb-6">
                    Full Integration Example
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-begin-blue/5 border border-begin-blue/20 rounded-card p-6">
                      <h3 className="font-semibold text-begin-blue mb-4">Implementation Guide</h3>
                      
                      <div className="space-y-4 text-sm">
                        <div>
                          <h4 className="font-medium text-begin-teal mb-2">1. Add Authentication Provider</h4>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs overflow-x-auto">
                            <code>{`// app/teacher/layout.tsx
import { SecureAuthProvider } from '@/lib/auth/hooks'

export default function TeacherLayout({ children }) {
  return (
    <SecureAuthProvider>
      {children}
    </SecureAuthProvider>
  )
}`}</code>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-begin-teal mb-2">2. Use Authentication Hook</h4>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs overflow-x-auto">
                            <code>{`// In your components
import { useTeacherAuth } from '@/lib/auth/hooks'

function MyComponent() {
  const { teacher, loading, logout } = useTeacherAuth()
  // Use teacher data and auth methods
}`}</code>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-begin-teal mb-2">3. Add UI Components</h4>
                          <div className="bg-gray-50 rounded p-3 font-mono text-xs overflow-x-auto">
                            <code>{`// Import and use components
import { 
  LogoutButton, 
  AuthStateIndicator,
  AuthenticatedHeader
} from '@/components/auth'

<AuthenticatedHeader showAuthState={true} />
<AuthStateIndicator variant="compact" />
<LogoutButton variant="menu" />`}</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 border border-green-200 rounded-card p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium text-green-800">Ready for Production</h4>
                        </div>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• FERPA compliant architecture</li>
                          <li>• Secure session management</li>
                          <li>• Mobile-responsive design</li>
                          <li>• TypeScript support</li>
                          <li>• Comprehensive error handling</li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-card p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Settings className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium text-blue-800">Easy Integration</h4>
                        </div>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Works with existing patterns</li>
                          <li>• Minimal setup required</li>
                          <li>• Backward compatible</li>
                          <li>• Customizable styling</li>
                          <li>• Performance optimized</li>
                        </ul>
                      </div>
                    </div>

                    <div className="text-center">
                      <Link
                        href="/teacher/dashboard"
                        className="btn-begin-primary inline-flex items-center gap-2"
                      >
                        See Live Integration
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
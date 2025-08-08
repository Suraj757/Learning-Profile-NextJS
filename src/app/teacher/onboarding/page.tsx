'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  Mail, 
  Eye, 
  CheckCircle, 
  ArrowRight, 
  BookOpen,
  Target,
  Zap,
  Heart,
  Play,
  ExternalLink
} from 'lucide-react'
import { useTeacherAuth } from '@/lib/teacher-auth'
import AuthRequired from '@/components/teacher/AuthRequired'

export default function TeacherOnboarding() {
  const { teacher } = useTeacherAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step])
    }
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const steps = [
    {
      id: 1,
      title: "Welcome to Begin Learning Profiles",
      subtitle: "Let's get you set up in 5 minutes",
      icon: <Heart className="h-6 w-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-begin-teal/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-begin-teal" />
            </div>
            <h2 className="text-2xl font-bold text-begin-blue mb-3">
              Welcome, {teacher?.name}! 👋
            </h2>
            <p className="text-begin-blue/70 text-lg mb-6">
              You're about to discover how learning profiles can transform your classroom. 
              This quick tour will show you exactly how to get valuable insights about every student.
            </p>
          </div>

          <div className="bg-begin-cyan/5 border border-begin-cyan/20 rounded-card p-6">
            <h3 className="font-semibold text-begin-blue mb-3">What you'll accomplish in the next 5 minutes:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-begin-teal text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-begin-blue">See what student insights look like (2 min)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-begin-teal text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-begin-blue">Create your first classroom (1 min)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-begin-teal text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-begin-blue">Try sending an assessment link (1 min)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-begin-teal text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <span className="text-begin-blue">Explore your teacher dashboard (1 min)</span>
              </div>
            </div>
          </div>

          <button
            onClick={nextStep}
            className="btn-begin-primary w-full text-lg py-3 flex items-center justify-center gap-2"
          >
            Let's Get Started <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )
    },
    {
      id: 2,
      title: "Step 1: See Student Insights in Action",
      subtitle: "Explore sample profiles to understand what you'll receive",
      icon: <Eye className="h-6 w-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-begin-blue mb-2">
              First, let's show you what student profiles look like
            </h2>
            <p className="text-begin-blue/70 mb-6">
              These are real examples of the insights you'll get about each student after their family completes the assessment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Link 
              href="/demo/emma-creative-collaborator" 
              target="_blank"
              className="card-begin hover:shadow-lg transition-shadow p-4 group"
              onClick={() => markStepComplete(2)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-begin-blue">Emma - Creative Collaborator</h3>
                  <p className="text-sm text-begin-blue/60">3rd Grade</p>
                </div>
                <ExternalLink className="h-4 w-4 text-begin-blue/40 group-hover:text-begin-teal" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="text-begin-blue">Strengths: Natural group leader, creative problem solver</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-begin-blue">Quick Win: Let her illustrate answers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span className="text-begin-blue">Interests: Art, Pets, Music</span>
                </div>
              </div>
            </Link>

            <Link 
              href="/demo/marcus-analytical-scholar" 
              target="_blank"
              className="card-begin hover:shadow-lg transition-shadow p-4 group"
              onClick={() => markStepComplete(2)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-begin-blue">Marcus - Analytical Scholar</h3>
                  <p className="text-sm text-begin-blue/60">5th Grade</p>
                </div>
                <ExternalLink className="h-4 w-4 text-begin-blue/40 group-hover:text-begin-teal" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="text-begin-blue">Strengths: Research skills, grasps complex concepts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-begin-blue">Quick Win: Provide step-by-step instructions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span className="text-begin-blue">Interests: Robots, Space, Computers</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-begin-teal/10 border border-begin-teal/20 rounded-card p-4">
            <div className="flex items-start gap-3">
              <Play className="h-5 w-5 text-begin-teal mt-0.5" />
              <div>
                <h4 className="font-semibold text-begin-blue mb-1">👆 Click on a profile above</h4>
                <p className="text-sm text-begin-blue/70">
                  Spend 2 minutes exploring what teachers receive. Notice the actionable strategies, 
                  student interests, and emergency backup plans. This is what you'll get for each of your students.
                </p>
              </div>
            </div>
          </div>

          {completedSteps.includes(2) && (
            <div className="flex items-center justify-center gap-2 text-begin-teal">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Great! You've seen what student insights look like.</span>
            </div>
          )}

          <button
            onClick={nextStep}
            className="btn-begin-primary w-full flex items-center justify-center gap-2"
          >
            Next: Create Your Classroom <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )
    },
    {
      id: 3,
      title: "Step 2: Create Your First Classroom",
      subtitle: "Set up your classroom to organize student profiles",
      icon: <Users className="h-6 w-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-begin-blue mb-2">
              Create your first classroom
            </h2>
            <p className="text-begin-blue/70 mb-6">
              Classrooms help you organize and manage learning profiles for different groups of students.
            </p>
          </div>

          <div className="bg-begin-gray/30 rounded-card p-6 text-center">
            <Users className="h-12 w-12 text-begin-blue/50 mx-auto mb-4" />
            <h3 className="font-semibold text-begin-blue mb-2">Quick Setup</h3>
            <p className="text-begin-blue/70 mb-4">
              Give your classroom a name (like "Ms. Johnson's Kindergarten" or "Room 12 - 2024") 
              and you're ready to start sending assessments to families.
            </p>
            
            <Link 
              href="/teacher/classroom/create"
              className="btn-begin-primary inline-flex items-center gap-2"
              onClick={() => markStepComplete(3)}
            >
              <Users className="h-4 w-4" />
              Create Classroom Now
            </Link>
          </div>

          {completedSteps.includes(3) && (
            <div className="flex items-center justify-center gap-2 text-begin-teal">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Perfect! Your classroom is set up.</span>
            </div>
          )}

          <button
            onClick={nextStep}
            className="btn-begin-primary w-full flex items-center justify-center gap-2"
          >
            Next: Send Assessment Link <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )
    },
    {
      id: 4,
      title: "Step 3: Try Sending an Assessment",
      subtitle: "See how easy it is to get families started",
      icon: <Mail className="h-6 w-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-begin-blue mb-2">
              Send your first assessment link
            </h2>
            <p className="text-begin-blue/70 mb-6">
              Experience how simple it is to invite families to complete their child's learning profile.
            </p>
          </div>

          <div className="space-y-4">
            <div className="card-begin p-4">
              <h3 className="font-semibold text-begin-blue mb-3">Option 1: Try it with yourself</h3>
              <p className="text-begin-blue/70 text-sm mb-4">
                Send an assessment to your own email to see the complete parent experience.
              </p>
              <Link 
                href="/teacher/send-assessment"
                className="btn-begin-secondary inline-flex items-center gap-2"
                onClick={() => markStepComplete(4)}
              >
                <Mail className="h-4 w-4" />
                Send Test Assessment
              </Link>
            </div>

            <div className="card-begin p-4">
              <h3 className="font-semibold text-begin-blue mb-3">Option 2: See the parent view</h3>
              <p className="text-begin-blue/70 text-sm mb-4">
                Experience what parents see when they click your assessment link.
              </p>
              <Link 
                href="/assessment/start"
                target="_blank"
                className="btn-begin-secondary inline-flex items-center gap-2"
                onClick={() => markStepComplete(4)}
              >
                <Play className="h-4 w-4" />
                Try Parent Experience
              </Link>
            </div>
          </div>

          <div className="bg-begin-cyan/10 border border-begin-cyan/20 rounded-card p-4">
            <h4 className="font-semibold text-begin-blue mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-begin-blue/70">
              Most teachers send assessments home during the first week of school or before parent-teacher conferences. 
              Parents typically complete them in 5-7 minutes while thinking about their child.
            </p>
          </div>

          {completedSteps.includes(4) && (
            <div className="flex items-center justify-center gap-2 text-begin-teal">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Excellent! You know how to get families involved.</span>
            </div>
          )}

          <button
            onClick={nextStep}
            className="btn-begin-primary w-full flex items-center justify-center gap-2"
          >
            Next: Explore Your Dashboard <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )
    },
    {
      id: 5,
      title: "Step 4: Your Teacher Dashboard",
      subtitle: "Discover all the tools at your fingertips",
      icon: <BookOpen className="h-6 w-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-begin-teal/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-begin-teal" />
            </div>
            <h2 className="text-xl font-bold text-begin-blue mb-2">
              🎉 You're all set up!
            </h2>
            <p className="text-begin-blue/70 mb-6">
              Now explore your teacher dashboard and discover all the ways learning profiles can support your instruction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Link 
              href="/teacher/dashboard"
              className="card-begin hover:shadow-lg transition-shadow p-4 group"
              onClick={() => markStepComplete(5)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-begin-teal/10 rounded-full p-2">
                  <BookOpen className="h-5 w-5 text-begin-teal" />
                </div>
                <div>
                  <h3 className="font-semibold text-begin-blue">Teacher Dashboard</h3>
                  <p className="text-sm text-begin-blue/60">Your central command center</p>
                </div>
              </div>
              <p className="text-sm text-begin-blue/70">
                View all your classrooms, track assessment completion, and access student insights in one place.
              </p>
            </Link>

            <Link 
              href="/teacher/student-cards"
              className="card-begin hover:shadow-lg transition-shadow p-4 group"
              onClick={() => markStepComplete(5)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-pink-100 rounded-full p-2">
                  <Users className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-begin-blue">Student Reference Cards</h3>
                  <p className="text-sm text-begin-blue/60">Daily classroom tools</p>
                </div>
              </div>
              <p className="text-sm text-begin-blue/70">
                Quick-reference cards with strengths, challenges, and intervention strategies for each student.
              </p>
            </Link>
          </div>

          <div className="bg-gradient-to-r from-begin-teal/5 to-begin-cyan/5 border border-begin-teal/20 rounded-card p-6">
            <h3 className="font-bold text-begin-blue mb-4">✨ What makes teachers successful with learning profiles:</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-begin-teal text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                <div>
                  <span className="font-semibold text-begin-blue">Start small:</span>
                  <span className="text-begin-blue/70"> Try with 5-6 families first to get comfortable with the insights.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-begin-teal text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                <div>
                  <span className="font-semibold text-begin-blue">Use the filters:</span>
                  <span className="text-begin-blue/70"> Focus on "Quick Wins" when you need immediate strategies, "Interests" for engagement.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-begin-teal text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                <div>
                  <span className="font-semibold text-begin-blue">Share with parents:</span>
                  <span className="text-begin-blue/70"> Use insights during conferences to show you truly understand their child.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/teacher/dashboard"
              className="btn-begin-primary flex-1 flex items-center justify-center gap-2"
            >
              Go to Dashboard <BookOpen className="h-4 w-4" />
            </Link>
            <Link 
              href="/teacher/help"
              className="btn-begin-secondary flex items-center justify-center gap-2"
            >
              Get Help & Support
            </Link>
          </div>

          {completedSteps.includes(5) && (
            <div className="text-center p-4 bg-begin-teal/10 border border-begin-teal/20 rounded-card">
              <CheckCircle className="h-8 w-8 text-begin-teal mx-auto mb-2" />
              <h3 className="font-bold text-begin-blue mb-1">Congratulations!</h3>
              <p className="text-sm text-begin-blue/70">
                You're ready to start using learning profiles to better understand and support every student in your classroom.
              </p>
            </div>
          )}
        </div>
      )
    }
  ]

  return (
    <AuthRequired>
      <div className="min-h-screen bg-begin-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-begin-blue">Teacher Onboarding</h1>
              <div className="text-sm text-begin-blue/70">
                Step {currentStep} of {steps.length}
              </div>
            </div>
            <div className="w-full bg-begin-gray/30 rounded-full h-2">
              <div 
                className="bg-begin-teal h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-card text-sm font-medium transition-colors ${
                  currentStep === step.id 
                    ? 'bg-begin-teal text-white' 
                    : completedSteps.includes(step.id)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-white text-begin-blue/70 hover:bg-begin-gray/20'
                }`}
              >
                {completedSteps.includes(step.id) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  React.cloneElement(step.icon, { className: "h-4 w-4" })
                )}
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.id}</span>
              </button>
            ))}
          </div>

          {/* Current Step Content */}
          <div className="card-begin">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                {React.cloneElement(steps[currentStep - 1].icon, { 
                  className: "h-6 w-6 text-begin-teal" 
                })}
                <h2 className="text-xl font-bold text-begin-blue">
                  {steps[currentStep - 1].title}
                </h2>
              </div>
              <p className="text-begin-blue/70">
                {steps[currentStep - 1].subtitle}
              </p>
            </div>
            
            {steps[currentStep - 1].content}
          </div>

          {/* Skip Option */}
          <div className="mt-8 text-center">
            <Link 
              href="/teacher/dashboard"
              className="text-begin-blue/60 hover:text-begin-blue text-sm underline"
            >
              Skip onboarding and go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </AuthRequired>
  )
}
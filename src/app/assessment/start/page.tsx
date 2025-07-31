'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowRight, Clock, Users } from 'lucide-react'

export default function AssessmentStartPage() {
  const [childName, setChildName] = useState('')
  const [grade, setGrade] = useState('')
  const router = useRouter()

  const handleStart = () => {
    if (childName.trim() && grade) {
      // Store child info in sessionStorage
      sessionStorage.setItem('childName', childName)
      sessionStorage.setItem('grade', grade)
      router.push('/assessment/question/1')
    }
  }

  const grades = [
    'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', 
    '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade'
  ]

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
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-begin p-8 lg:p-12">
          <div className="text-center mb-8">
            <div className="bg-begin-teal/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-begin-teal" />
            </div>
            <h1 className="text-begin-display font-bold text-begin-blue mb-4">
              Create Your Child&apos;s Learning Profile
            </h1>
            <p className="text-begin-body text-gray-600 max-w-2xl mx-auto">
              Help your child&apos;s teacher understand their unique learning style from Day 1. 
              This 5-minute assessment will create a personalized profile to strengthen the school-home connection.
            </p>
          </div>

          {/* Assessment Info */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-begin-blue/5 rounded-2xl">
              <Clock className="h-8 w-8 text-begin-blue mx-auto mb-2" />
              <h3 className="font-semibold text-begin-blue mb-1">5 Minutes</h3>
              <p className="text-sm text-gray-600">Quick and engaging</p>
            </div>
            <div className="text-center p-4 bg-begin-teal/5 rounded-2xl">
              <BookOpen className="h-8 w-8 text-begin-teal mx-auto mb-2" />
              <h3 className="font-semibold text-begin-teal mb-1">24 Questions</h3>
              <p className="text-sm text-gray-600">Research-based framework</p>
            </div>
            <div className="text-center p-4 bg-begin-cyan/10 rounded-2xl">
              <Users className="h-8 w-8 text-begin-cyan mx-auto mb-2" />
              <h3 className="font-semibold text-begin-cyan mb-1">Teacher Ready</h3>
              <p className="text-sm text-gray-600">Shareable with educators</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label htmlFor="childName" className="block text-begin-heading font-semibold text-begin-blue mb-2">
                Child&apos;s First Name
              </label>
              <input
                type="text"
                id="childName"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-begin-teal focus:border-transparent text-begin-body"
                placeholder="Enter your child's first name"
                required
              />
            </div>

            <div>
              <label htmlFor="grade" className="block text-begin-heading font-semibold text-begin-blue mb-2">
                Current Grade Level
              </label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-begin-teal focus:border-transparent text-begin-body"
                required
              >
                <option value="">Select grade level</option>
                {grades.map((gradeOption) => (
                  <option key={gradeOption} value={gradeOption}>
                    {gradeOption}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-begin-cyan/5 p-6 rounded-2xl">
              <h4 className="font-semibold text-begin-blue mb-2">What to Expect:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Questions about your child&apos;s classroom behaviors and learning preferences</li>
                <li>• Based on the 6C framework: Communication, Collaboration, Content, Critical Thinking, Creative Innovation, and Confidence</li>
                <li>• Results include personalized Begin product recommendations</li>
                <li>• Shareable profile for teachers and educators</li>
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleStart}
                disabled={!childName.trim() || !grade}
                className="btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                Start Learning Profile
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
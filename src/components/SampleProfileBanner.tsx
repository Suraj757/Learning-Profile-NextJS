'use client'
import Link from 'next/link'
import { Eye, Play, ArrowRight, Sparkles } from 'lucide-react'

interface SampleProfileBannerProps {
  childName: string
  profileId: string
}

export default function SampleProfileBanner({ childName, profileId }: SampleProfileBannerProps) {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="bg-yellow-100 p-3 rounded-lg flex-shrink-0">
          <Eye className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-yellow-800 mb-2">
            You're Viewing a Sample Learning Profile
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            This is a real example showing the depth of insights you'll get. 
            <strong> {childName}'s profile</strong> demonstrates how our assessment identifies unique learning patterns and provides specific, actionable strategies for parents and teachers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/assessment/start"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Create Your Child's Profile
            </Link>
            <Link 
              href="/demo"
              className="bg-white hover:bg-yellow-50 text-yellow-800 border border-yellow-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Browse More Samples
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
        <div className="flex items-center gap-2 text-xs text-yellow-800">
          <Sparkles className="h-4 w-4" />
          <span className="font-medium">Your actual profile will be personalized to your child's unique responses and completely different from this sample.</span>
        </div>
      </div>
    </div>
  )
}
'use client'
import Link from 'next/link'
import { Play, Eye, Users, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

interface SampleProfileCTAProps {
  currentProfileName: string
  currentProfileId: string
  showRelatedProfiles?: boolean
}

const RELATED_PROFILES = [
  { id: 'emma-creative-collaborator', name: 'Emma', type: 'Creative Collaborator', age: 8 },
  { id: 'marcus-analytical-scholar', name: 'Marcus', type: 'Analytical Scholar', age: 10 },
  { id: 'sofia-social-connector', name: 'Sofia', type: 'Social Connector', age: 6 },
  { id: 'aiden-independent-explorer', name: 'Aiden', type: 'Independent Explorer', age: 9 },
  { id: 'zara-confident-builder', name: 'Zara', type: 'Confident Builder', age: 7 },
  { id: 'kai-thoughtful-innovator', name: 'Kai', type: 'Creative Problem Solver', age: 11 },
  { id: 'maya-developing-communicator', name: 'Maya', type: 'Emerging Scholar', age: 5 },
  { id: 'diego-balanced-learner', name: 'Diego', type: 'Natural Leader', age: 12 }
]

export default function SampleProfileCTA({ 
  currentProfileName, 
  currentProfileId, 
  showRelatedProfiles = true 
}: SampleProfileCTAProps) {
  const relatedProfiles = RELATED_PROFILES
    .filter(p => p.id !== currentProfileId)
    .slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Main CTA */}
      <div className="card-begin p-8 bg-gradient-to-r from-begin-teal/10 to-begin-cyan/10 text-center">
        <h3 className="text-2xl font-bold text-begin-blue mb-4">
          Ready to Discover Your Child's Unique Profile?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          This sample shows the depth of insights available through our assessment. 
          Create a personalized profile for your child in just 10 minutes and get strategies you can use immediately.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link 
            href="/assessment/start" 
            className="btn-begin-primary flex items-center gap-2 px-8 py-3"
          >
            <Play className="h-5 w-5" />
            Start Your Assessment (10 min)
          </Link>
          <Link 
            href="/demo" 
            className="btn-begin-secondary flex items-center gap-2 px-8 py-3"
          >
            <Eye className="h-5 w-5" />
            Browse More Samples
          </Link>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">Your child's profile will be unique to their responses</span>
          </div>
        </div>
      </div>

      {/* Benefits Reminder */}
      <div className="card-begin p-6">
        <h4 className="text-lg font-bold text-begin-blue mb-4">When You Create Your Child's Profile, You'll Get:</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Personalized learning strategies for home</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Ready-to-send email templates for teachers</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Month-by-month development roadmap</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Specific Begin product recommendations</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Parent-teacher conference talking points</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Daily activities you can do today</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Shareable reference card for teachers</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Free forever access to your results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Sample Profiles */}
      {showRelatedProfiles && (
        <div className="card-begin p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-begin-teal" />
            <h4 className="text-lg font-bold text-begin-blue">Explore More Sample Profiles</h4>
          </div>
          <p className="text-gray-600 mb-6">
            See how different children learn and the variety of insights our assessment provides
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {relatedProfiles.map(profile => (
              <Link 
                key={profile.id}
                href={`/demo/${profile.id}`}
                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-begin-blue mb-1">{profile.name}, {profile.age}</div>
                <div className="text-sm text-begin-teal mb-2">{profile.type}</div>
                <div className="text-xs text-gray-600 flex items-center gap-1">
                  View Profile <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              href="/demo" 
              className="text-begin-teal hover:text-begin-blue font-medium inline-flex items-center gap-2"
            >
              See All Sample Profiles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
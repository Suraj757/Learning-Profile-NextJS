'use client'
import { Users, Home, School, Lightbulb, Quote, Star, TrendingUp, Target, CheckCircle } from 'lucide-react'

interface SampleInsightsProps {
  sampleData: {
    backstory: string
    parentQuote: string
    teacherInsight: string
    realWorldExample: string
    strengths: string[]
    growthAreas: string[]
    age: number
  }
  childName: string
}

export default function SampleInsights({ sampleData, childName }: SampleInsightsProps) {
  return (
    <div className="space-y-8">
      {/* Sample-Specific Insights Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-begin-blue mb-2">Sample Profile Deep Dive</h2>
        <p className="text-gray-600">See the rich insights you'll get for your own child</p>
      </div>

      {/* Backstory and Real-World Example */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card-begin p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-begin-blue">About {childName}</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{sampleData.backstory}</p>
        </div>

        <div className="card-begin p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Lightbulb className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-begin-blue">Learning in Action</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{sampleData.realWorldExample}</p>
        </div>
      </div>

      {/* Parent and Teacher Perspectives */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card-begin p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-pink-100 p-2 rounded-lg">
              <Home className="h-5 w-5 text-pink-600" />
            </div>
            <h3 className="text-lg font-bold text-begin-blue">Parent Perspective</h3>
          </div>
          <div className="relative">
            <Quote className="h-8 w-8 text-pink-200 absolute -top-2 -left-2" />
            <p className="text-gray-700 italic leading-relaxed pl-6">
              "{sampleData.parentQuote}"
            </p>
          </div>
        </div>

        <div className="card-begin p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <School className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-begin-blue">Teacher Insight</h3>
          </div>
          <div className="relative">
            <Quote className="h-8 w-8 text-purple-200 absolute -top-2 -left-2" />
            <p className="text-gray-700 italic leading-relaxed pl-6">
              "{sampleData.teacherInsight}"
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Strengths and Growth Areas */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card-begin p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Star className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-begin-blue">Key Strengths</h3>
          </div>
          <div className="space-y-3">
            {sampleData.strengths.map((strength, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-800">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-begin p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-bold text-begin-blue">Growth Opportunities</h3>
          </div>
          <div className="space-y-3">
            {sampleData.growthAreas.map((area, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                <Target className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-800">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What Makes This Sample Special */}
      <div className="card-begin p-6 bg-gradient-to-br from-begin-teal/5 to-begin-cyan/5 border border-begin-teal/20">
        <h3 className="text-lg font-bold text-begin-blue mb-4">What Makes This Sample Special</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg border border-begin-teal/20">
            <h4 className="font-medium text-begin-teal mb-2">Authentic Data</h4>
            <p className="text-gray-700">Based on real classroom observations and parent insights</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-begin-teal/20">
            <h4 className="font-medium text-begin-teal mb-2">Comprehensive View</h4>
            <p className="text-gray-700">Shows both home and school perspectives of learning</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-begin-teal/20">
            <h4 className="font-medium text-begin-teal mb-2">Actionable Insights</h4>
            <p className="text-gray-700">Provides specific strategies parents and teachers can use</p>
          </div>
        </div>
      </div>
    </div>
  )
}
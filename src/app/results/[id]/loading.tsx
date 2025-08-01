import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function Loading() {
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
            <div className="flex items-center gap-3">
              <div className="w-20 h-10 bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="w-20 h-10 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Skeleton */}
        <div className="card-begin p-8 mb-8 animate-pulse">
          <div className="text-center mb-8">
            <div className="bg-gray-200 rounded-2xl p-6 mb-6 max-w-2xl mx-auto h-32"></div>
            
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            </div>
          </div>

          <div className="bg-begin-cyan/5 p-6 rounded-2xl">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Radar Chart Skeleton */}
          <div className="card-begin p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-6"></div>
            <div className="h-80 bg-gray-200 rounded-2xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
          </div>

          {/* Detailed Breakdown Skeleton */}
          <div className="card-begin p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Skeleton */}
        <div className="card-begin p-8 mt-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-64 mx-auto mb-6"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="bg-gradient-to-br from-begin-teal/5 to-begin-cyan/5 p-6 rounded-2xl border border-begin-teal/10">
                <div className="w-12 h-12 bg-gray-200 rounded mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items Skeleton */}
        <div className="card-begin p-8 mt-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-6"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <div className="w-40 h-12 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
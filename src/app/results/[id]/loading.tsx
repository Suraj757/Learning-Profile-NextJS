import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import DelightfulLoading from '@/components/loading/DelightfulLoading'

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
        {/* Delightful Loading Experience */}
        <div className="mb-8">
          <DelightfulLoading 
            type="profile" 
            size="lg"
            customMessages={[
              "🎨 Painting this amazing learning profile...",
              "🌟 Gathering all the learning superpowers...",
              "📊 Creating beautiful charts and insights...",
              "🎯 Preparing personalized recommendations...",
              "✨ Adding the final magical touches..."
            ]}
          />
        </div>

        {/* Enhanced Profile Header Skeleton with Personality */}
        <div className="card-begin p-8 mb-8 relative overflow-hidden">
          {/* Subtle animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-begin-cyan/3 via-begin-teal/3 to-purple-500/3 animate-gradient-shift rounded-card" />
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              {/* Main profile placeholder with shimmer */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 mb-6 max-w-2xl mx-auto h-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
              
              {/* Animated stats placeholders */}
              <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.2}s` }}>
                    <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 mx-auto mb-2 animate-pulse" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 mx-auto animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Description placeholder with staggered animation */}
            <div className="bg-begin-cyan/5 p-6 rounded-2xl">
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className={`h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-fade-in-up ${
                      i === 0 ? 'w-full' : i === 1 ? 'w-3/4 mx-auto' : 'w-5/6 mx-auto'
                    }`}
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enhanced Radar Chart Skeleton */}
          <div className="card-begin p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-begin-teal/3 to-begin-cyan/3 animate-gradient-shift rounded-card" />
            <div className="relative z-10">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 mx-auto mb-6 animate-pulse" />
              
              {/* Circular chart placeholder with orbiting elements */}
              <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                
                {/* Animated chart representation */}
                <div className="relative">
                  <div className="w-40 h-40 border-4 border-begin-teal/20 rounded-full animate-spin-slow" />
                  <div className="absolute inset-4 border-2 border-begin-cyan/30 rounded-full animate-pulse" />
                  <div className="absolute inset-8 border border-purple-400/20 rounded-full animate-ping" />
                </div>
              </div>
              
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-64 mx-auto animate-pulse" />
            </div>
          </div>

          {/* Enhanced Detailed Breakdown Skeleton */}
          <div className="card-begin p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 to-pink-500/3 animate-gradient-shift rounded-card" />
            <div className="relative z-10">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 mb-6 animate-pulse" />
              <div className="space-y-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex-1">
                      <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mb-2 animate-pulse" />
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gradient-to-r from-begin-teal/20 to-begin-cyan/20 rounded-full h-2 animate-pulse" />
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-12 animate-pulse" />
                      </div>
                    </div>
                    <div className="w-20 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Recommendations Skeleton */}
        <div className="card-begin p-8 mt-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-begin-cyan/3 via-begin-teal/3 to-yellow-500/3 animate-gradient-shift rounded-card" />
          <div className="relative z-10">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-64 mx-auto mb-6 animate-pulse" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }, (_, i) => (
                <div 
                  key={i} 
                  className="bg-gradient-to-br from-begin-teal/5 to-begin-cyan/5 p-6 rounded-2xl border border-begin-teal/10 animate-bounce-in"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded mb-3 animate-pulse" />
                  <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mb-2 animate-pulse" />
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full animate-pulse" />
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 animate-pulse" />
                  </div>
                  <div className="w-20 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Action Items Skeleton */}
        <div className="card-begin p-8 mt-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 to-blue-500/3 animate-gradient-shift rounded-card" />
          <div className="relative z-10">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 mx-auto mb-6 animate-pulse" />
            <div className="grid md:grid-cols-2 gap-8">
              {[...Array(2)].map((_, colIndex) => (
                <div key={colIndex} className="animate-fade-in-up" style={{ animationDelay: `${colIndex * 0.2}s` }}>
                  <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mb-4 animate-pulse" />
                  <div className="space-y-2">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div 
                        key={i} 
                        className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full animate-pulse"
                        style={{ animationDelay: `${(colIndex * 4 + i) * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-8">
              <div className="w-40 h-12 bg-gradient-to-r from-begin-teal/20 to-begin-cyan/20 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
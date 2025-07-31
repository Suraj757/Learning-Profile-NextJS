import Link from 'next/link'
import { ArrowRight, Users, BookOpen, Target, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Begin Learning Profile</span>
            </div>
            <Link 
              href="/teacher/register"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              👩‍🏫 Teacher Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Help Your Child&apos;s Teacher Understand Their{' '}
            <span className="text-blue-600">Unique Learning Style</span>{' '}
            from Day 1
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join 50,000+ families using Begin Learning Profiles to strengthen school-home connections. 
            Get personalized insights and Begin product recommendations tailored to your child&apos;s learning strengths.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/assessment/start"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Start Learning Profile
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="#preview"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              See Example Results
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">5-Minute Assessment</h3>
              <p className="text-gray-600">Quick, engaging questionnaire based on classroom behaviors teachers and parents both observe.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Teacher-Parent Bridge</h3>
              <p className="text-gray-600">Creates shared understanding between educators and families from the first day of school.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Recommendations</h3>
              <p className="text-gray-600">Get Begin product suggestions and activities matched to your child&apos;s unique learning profile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="preview" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See What You&apos;ll Get</h2>
            <p className="text-xl text-gray-600">Interactive learning profiles that help both teachers and parents understand your child</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6">
                <h3 className="text-2xl font-bold mb-2">Emma&apos;s Learning Profile</h3>
                <p className="text-lg">🌟 Creative Collaborator</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Communication</div>
                  <div className="text-sm text-gray-600">High Strength</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">Creative Innovation</div>
                  <div className="text-sm text-gray-600">High Strength</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">Collaboration</div>
                  <div className="text-sm text-gray-600">Developing</div>
                </div>
              </div>
              
              <div className="text-left bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Recommended for Emma:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>📱 Begin Creative App - Art & Storytelling</li>
                  <li>🎨 Creative Arts Learning Kit</li>
                  <li>👩‍🏫 Creative Writing Workshop (Live Class)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Teachers & Parents</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4 italic">
                &ldquo;The Begin Learning Profile helped me understand why my daughter was struggling in traditional math activities. 
                Now I know she&apos;s a kinesthetic learner, and we use Begin&apos;s hands-on math kit at home. Her confidence has soared!&rdquo;
              </p>
              <div className="font-semibold">Sarah M.</div>
              <div className="text-sm text-gray-600">Parent of 2nd grader</div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4 italic">
                &ldquo;As a kindergarten teacher, having learning profiles from Day 1 completely changed how I approach my classroom. 
                I can differentiate instruction from the start instead of spending weeks figuring out each child&apos;s needs.&rdquo;
              </p>
              <div className="font-semibold">Mrs. Rodriguez</div>
              <div className="text-sm text-gray-600">Kindergarten Teacher</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Discover Your Child&apos;s Learning Language?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of families strengthening the school-home connection with personalized learning insights.
          </p>
          <Link 
            href="/assessment/start"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            Start Your Child&apos;s Profile
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BookOpen className="h-6 w-6" />
              <span className="text-lg font-semibold">Begin Learning Profile</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 Begin Learning. Strengthening school-home connections.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
import Link from 'next/link'
import { ArrowRight, Users, BookOpen, Target, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-begin-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-begin-teal" />
              <span className="text-heading-lg font-bold text-begin-blue">Begin Learning Profile</span>
            </div>
            <Link 
              href="/teacher/register"
              className="text-begin-teal hover:text-begin-teal-hover font-semibold text-body transition-colors"
            >
              Teacher Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-begin px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 max-w-3xl mx-auto">
            <p className="text-red-700 text-body font-medium">
              😰 <strong>Back-to-School Anxiety?</strong> Will your child&apos;s teacher really &quot;get&quot; them this year?
            </p>
          </div>
          
          <h1 className="text-display md:text-display font-bold text-begin-blue mb-8 text-balance">
            Get Your Child&apos;s{' '}
            <span className="text-begin-teal">Learning Superpowers</span>{' '}
            Into Their Teacher&apos;s Hands by Day 1
          </h1>
          
          <p className="text-body-lg text-begin-blue/80 mb-6 max-w-4xl mx-auto leading-relaxed">
            <strong>Join 50,000+ families</strong> who&apos;ve eliminated back-to-school guesswork with personalized learning profiles. 
            Get specific strategies, Begin product recommendations, and teacher conversation starters.
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-begin-blue/70 mb-10">
            <span className="flex items-center gap-1">
              ⏱️ <strong>5 minutes</strong> to complete
            </span>
            <span className="flex items-center gap-1">
              🎯 <strong>24 questions</strong> based on classroom research
            </span>
            <span className="flex items-center gap-1">
              📊 <strong>Instant results</strong> with action plan
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/assessment/start"
              className="btn-begin-primary flex items-center justify-center gap-3 min-w-64 text-lg py-5"
            >
              🚀 Get My Child&apos;s Profile Now
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/demo"
              className="btn-begin-secondary min-w-64 text-lg py-5"
            >
              See Real Results First
            </Link>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-begin-blue/60">
              ✅ <strong>Free forever</strong> • ✅ <strong>No email required</strong> • ✅ <strong>Instant results</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-begin bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-hero font-bold text-begin-blue mb-6 text-balance">
              Simple, Powerful, Effective
            </h2>
            <p className="text-body-lg text-begin-blue/80 max-w-3xl mx-auto">
              Three key features that make learning profiles work for families and teachers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-begin text-center">
              <div className="bg-begin-light-blue/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-begin-teal" />
              </div>
              <h3 className="text-heading-lg font-bold mb-4 text-begin-blue">5-Minute Assessment</h3>
              <p className="text-body text-begin-blue/70 leading-relaxed">Quick, engaging questionnaire based on classroom behaviors teachers and parents both observe.</p>
            </div>
            
            <div className="card-begin text-center">
              <div className="bg-begin-cyan/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-begin-teal" />
              </div>
              <h3 className="text-heading-lg font-bold mb-4 text-begin-blue">Teacher-Parent Bridge</h3>
              <p className="text-body text-begin-blue/70 leading-relaxed">Creates shared understanding between educators and families from the first day of school.</p>
            </div>
            
            <div className="card-begin text-center">
              <div className="bg-begin-light-blue/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-10 w-10 text-begin-teal" />
              </div>
              <h3 className="text-heading-lg font-bold mb-4 text-begin-blue">Personalized Recommendations</h3>
              <p className="text-body text-begin-blue/70 leading-relaxed">Get Begin product suggestions and activities matched to your child&apos;s unique learning profile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Examples Preview */}
      <section id="preview" className="section-begin bg-begin-gray/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-hero font-bold text-begin-blue mb-6 text-balance">See What You&apos;ll Get</h2>
            <p className="text-body-lg text-begin-blue/80 max-w-3xl mx-auto">
              Browse real learning profiles from diverse families and see the depth of insights you'll receive
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-card shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-pink-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🎨</span>
              </div>
              <h3 className="text-heading font-bold text-begin-blue mb-2">Emma, 8 years old</h3>
              <p className="text-body text-begin-teal font-medium mb-3">Creative Collaborator</p>
              <p className="text-body text-begin-blue/70 mb-4">Thrives in group art projects and loves helping other students feel included.</p>
              <Link href="/demo/emma-creative-collaborator" className="text-begin-teal hover:text-begin-blue font-medium text-sm">
                View Full Profile →
              </Link>
            </div>
            
            <div className="bg-white rounded-card shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🧠</span>
              </div>
              <h3 className="text-heading font-bold text-begin-blue mb-2">Marcus, 10 years old</h3>
              <p className="text-body text-begin-teal font-medium mb-3">Analytical Scholar</p>
              <p className="text-body text-begin-blue/70 mb-4">Loves deep research projects and asks questions that make everyone think.</p>
              <Link href="/demo/marcus-analytical-scholar" className="text-begin-teal hover:text-begin-blue font-medium text-sm">
                View Full Profile →
              </Link>
            </div>
            
            <div className="bg-white rounded-card shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🤝</span>
              </div>
              <h3 className="text-heading font-bold text-begin-blue mb-2">Sofia, 6 years old</h3>
              <p className="text-body text-begin-teal font-medium mb-3">Social Connector</p>
              <p className="text-body text-begin-blue/70 mb-4">Natural classroom helper who makes sure everyone feels welcome and understood.</p>
              <Link href="/demo/sofia-social-connector" className="text-begin-teal hover:text-begin-blue font-medium text-sm">
                View Full Profile →
              </Link>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              href="/demo"
              className="btn-begin-primary inline-flex items-center gap-3"
            >
              Browse All Sample Profiles
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-sm text-begin-blue/60 mt-4">
              See profiles from Kindergarten through 8th grade • All learning types included
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-begin bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-hero font-bold text-begin-blue mb-6 text-balance">
              Why 50,000+ Families Love This
            </h2>
            <p className="text-body-lg text-begin-blue/80 max-w-3xl mx-auto">
              <strong>&quot;Finally, a way to help my child&apos;s teacher understand them from Day 1!&quot;</strong>
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="card-begin bg-begin-light-blue/10 border border-begin-light-blue/30">
              <p className="text-body text-begin-blue/90 mb-6 italic leading-relaxed">
                &ldquo;The Begin Learning Profile helped me understand why my daughter was struggling in traditional math activities. 
                Now I know she&apos;s a kinesthetic learner, and we use Begin&apos;s hands-on math kit at home. Her confidence has soared!&rdquo;
              </p>
              <div className="border-t border-begin-light-blue/30 pt-4">
                <div className="font-bold text-begin-blue">Sarah M.</div>
                <div className="text-body text-begin-blue/70">Parent of 2nd grader</div>
              </div>
            </div>
            
            <div className="card-begin bg-begin-cyan/5 border border-begin-cyan/20">
              <p className="text-body text-begin-blue/90 mb-6 italic leading-relaxed">
                &ldquo;As a kindergarten teacher, having learning profiles from Day 1 completely changed how I approach my classroom. 
                I can differentiate instruction from the start instead of spending weeks figuring out each child&apos;s needs.&rdquo;
              </p>
              <div className="border-t border-begin-cyan/20 pt-4">
                <div className="font-bold text-begin-blue">Mrs. Rodriguez</div>
                <div className="text-body text-begin-blue/70">Kindergarten Teacher</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-begin bg-begin-teal text-white">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4 mb-8 max-w-3xl mx-auto">
            <p className="text-yellow-800 text-body font-medium">
              ⏰ <strong>School starts soon!</strong> Get your child&apos;s profile ready before teacher meetings.
            </p>
          </div>
          
          <h2 className="text-hero font-bold mb-6 text-balance">
            Don&apos;t Let Your Child Get Lost in the Classroom
          </h2>
          <p className="text-body-lg mb-10 opacity-90 max-w-4xl mx-auto leading-relaxed">
            <strong>Take 5 minutes now</strong> to give your child&apos;s teacher the roadmap they need to help your child thrive from Day 1.
          </p>
          <Link 
            href="/assessment/start"
            className="bg-white text-begin-teal px-10 py-5 rounded-begin text-body-lg font-bold hover:bg-begin-cream transition-all duration-200 inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
          >
            Start Your Child&apos;s Profile
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-begin-blue text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <BookOpen className="h-8 w-8 text-begin-cyan" />
              <span className="text-heading-lg font-bold">Begin Learning Profile</span>
            </div>
            <div className="text-body text-white/80">
              © 2025 Begin Learning. Strengthening school-home connections.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
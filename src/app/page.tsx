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
          <h1 className="text-display md:text-display font-bold text-begin-blue mb-8 text-balance">
            Help Your Child&apos;s Teacher Understand Their{' '}
            <span className="text-begin-teal">Unique Learning Style</span>{' '}
            from Day 1
          </h1>
          
          <p className="text-body-lg text-begin-blue/80 mb-10 max-w-4xl mx-auto leading-relaxed">
            Join 50,000+ families using Begin Learning Profiles to strengthen school-home connections. 
            Get personalized insights and Begin product recommendations tailored to your child&apos;s learning strengths.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/assessment/start"
              className="btn-begin-primary flex items-center justify-center gap-3 min-w-64"
            >
              Start Learning Profile
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="#preview"
              className="btn-begin-secondary min-w-64"
            >
              See Example Results
            </Link>
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

      {/* Dashboard Preview */}
      <section id="preview" className="section-begin bg-begin-gray/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-hero font-bold text-begin-blue mb-6 text-balance">See What You&apos;ll Get</h2>
            <p className="text-body-lg text-begin-blue/80 max-w-3xl mx-auto">
              Interactive learning profiles that help both teachers and parents understand your child
            </p>
          </div>
          
          <div className="bg-white rounded-card shadow-lg p-8 lg:p-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-gradient-to-r from-begin-teal to-begin-cyan text-white rounded-card p-8 mb-8">
                <h3 className="text-heading-lg font-bold mb-3">Emma&apos;s Learning Profile</h3>
                <p className="text-body-lg opacity-90">Creative Collaborator</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-begin-light-blue/20 p-6 rounded-card border border-begin-light-blue/30">
                  <div className="text-heading font-bold text-begin-teal mb-2">Communication</div>
                  <div className="text-body text-begin-blue/70">High Strength</div>
                </div>
                <div className="bg-begin-cyan/10 p-6 rounded-card border border-begin-cyan/30">
                  <div className="text-heading font-bold text-begin-teal mb-2">Creative Innovation</div>
                  <div className="text-body text-begin-blue/70">High Strength</div>
                </div>
                <div className="bg-begin-gray/50 p-6 rounded-card border border-begin-gray">
                  <div className="text-heading font-bold text-begin-blue mb-2">Collaboration</div>
                  <div className="text-body text-begin-blue/70">Developing</div>
                </div>
              </div>
              
              <div className="text-left bg-begin-cream p-6 rounded-card border border-begin-gray">
                <h4 className="text-heading font-bold text-begin-blue mb-4">Recommended for Emma:</h4>
                <ul className="space-y-3 text-body text-begin-blue/80">
                  <li className="flex items-center gap-3">
                    <span className="text-begin-teal font-medium">•</span>
                    Begin Creative App - Art & Storytelling
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-begin-teal font-medium">•</span>
                    Creative Arts Learning Kit
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-begin-teal font-medium">•</span>
                    Creative Writing Workshop (Live Class)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-begin bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-hero font-bold text-begin-blue mb-6 text-balance">
              Trusted by Teachers & Parents
            </h2>
            <p className="text-body-lg text-begin-blue/80 max-w-3xl mx-auto">
              Real stories from families and educators using Begin Learning Profiles
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
          <h2 className="text-hero font-bold mb-6 text-balance">
            Ready to Discover Your Child&apos;s Learning Language?
          </h2>
          <p className="text-body-lg mb-10 opacity-90 max-w-4xl mx-auto leading-relaxed">
            Join thousands of families strengthening the school-home connection with personalized learning insights.
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
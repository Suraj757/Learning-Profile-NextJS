import Link from 'next/link'
import { ArrowRight, BookOpen, Users, Target, Star, ChevronRight, CheckCircle, School, Mail, BarChart3, Clock, Heart, Award, Lightbulb, UserCheck } from 'lucide-react'

export default function TeachersLandingPage() {
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
            <div className="flex items-center space-x-6">
              <Link 
                href="/teacher/register"
                className="btn-begin-primary"
              >
                Get Started Free
              </Link>
              <Link 
                href="/"
                className="text-begin-teal hover:text-begin-teal-hover font-semibold text-body transition-colors"
              >
                For Parents
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-begin px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-gradient-to-r from-begin-teal to-begin-cyan text-white rounded-2xl p-4 mb-6 max-w-4xl mx-auto">
            <p className="text-white text-body font-medium">
              <Award className="h-5 w-5 inline mr-2" />
              <strong>FREE for All Educators</strong> • Research-backed personalized learning insights for your classroom
            </p>
          </div>
          
          <h1 className="text-display md:text-display font-bold text-begin-blue mb-6 text-balance">
            Know Every Student&apos;s{' '}
            <span className="text-begin-teal">Learning Style</span>{' '}
            Before Day 1
          </h1>
          
          <p className="text-body-lg text-begin-blue/80 mb-8 max-w-4xl mx-auto leading-relaxed">
            <strong>Join 2,500+ educators</strong> using research-backed learning profiles to differentiate instruction from the first day of school. 
            Get detailed insights on each student&apos;s learning preferences, strengths, and needs delivered directly to your classroom dashboard.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-begin-blue/70 mb-10 flex-wrap">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <strong>100% Free</strong> for teachers
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <strong>5-minute setup</strong>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <strong>Evidence-based</strong> framework
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <strong>Immediate insights</strong>
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/teacher/register"
              className="btn-begin-primary flex items-center justify-center gap-3 min-w-64 text-lg py-5"
            >
              Start Free Teacher Account
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/demo"
              className="btn-begin-secondary min-w-64 text-lg py-5"
            >
              See Sample Student Profiles
            </Link>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-begin-blue/60">
              No credit card required • Instant access • Works with any grade level K-8
            </p>
          </div>
        </div>
      </section>

      {/* Research Foundation */}
      <section className="section-begin bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="bg-begin-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="h-8 w-8 text-begin-blue" />
            </div>
            <h2 className="text-hero font-bold text-begin-blue mb-6 text-balance">
              Built on 40+ Years of Learning Science
            </h2>
            <p className="text-body-lg text-begin-blue/80 max-w-3xl mx-auto mb-8">
              Our assessment framework integrates research from Howard Gardner&apos;s Multiple Intelligence Theory, 
              Carol Dweck&apos;s Growth Mindset research, and classroom observation protocols used by leading educators.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card-begin text-center">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-heading-lg font-bold mb-4 text-begin-blue">Multiple Intelligence Framework</h3>
              <p className="text-body text-begin-blue/70 leading-relaxed">
                Based on Gardner&apos;s research identifying 8 distinct intelligence types, helping you recognize each student&apos;s natural strengths.
              </p>
            </div>
            
            <div className="card-begin text-center">
              <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-heading-lg font-bold mb-4 text-begin-blue">Growth Mindset Assessment</h3>
              <p className="text-body text-begin-blue/70 leading-relaxed">
                Incorporates Dweck&apos;s growth mindset principles to identify each student&apos;s motivational patterns and learning resilience.
              </p>
            </div>
            
            <div className="card-begin text-center">
              <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-heading-lg font-bold mb-4 text-begin-blue">Classroom Observation Data</h3>
              <p className="text-body text-begin-blue/70 leading-relaxed">
                Questions designed by practicing teachers to capture the behaviors and preferences you observe daily in your classroom.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits for Teachers */}
      <section className="section-begin bg-begin-gray/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-hero font-bold text-begin-blue mb-6 text-balance">
              Transform Your Classroom from Day 1
            </h2>
            <p className="text-body-lg text-begin-blue/80 max-w-3xl mx-auto">
              Stop spending weeks figuring out each student. Get research-backed insights that help you differentiate instruction immediately.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="bg-begin-teal w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-heading font-bold text-begin-blue mb-2">Save 3-4 Weeks of Assessment Time</h3>
                  <p className="text-body text-begin-blue/70">Instead of spending the first month figuring out learning styles, get detailed insights before students walk through your door.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-begin-blue w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-heading font-bold text-begin-blue mb-2">Differentiate from Day 1</h3>
                  <p className="text-body text-begin-blue/70">Know which students need hands-on activities, visual aids, collaborative work, or independent challenges before you meet them.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-begin-cyan w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-heading font-bold text-begin-blue mb-2">Build Stronger Parent Partnerships</h3>
                  <p className="text-body text-begin-blue/70">Start parent conversations with shared understanding of each child&apos;s strengths and learning preferences.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-heading font-bold text-begin-blue mb-2">Reduce Behavioral Challenges</h3>
                  <p className="text-body text-begin-blue/70">Understand each student&apos;s optimal learning environment and social preferences to prevent frustration-based disruptions.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-card shadow-lg p-8">
              <h3 className="text-heading-lg font-bold text-begin-blue mb-6">What You&apos;ll Get for Each Student:</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-body">Detailed learning style profile (Visual, Auditory, Kinesthetic, Reading/Writing)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-body">Social learning preferences (Individual, Small Group, Large Group)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-body">Motivational drivers and challenge level preferences</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-body">Communication style and feedback preferences</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-body">Specific classroom strategies tailored to each student</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-body">Parent conversation starters and collaboration tips</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Testimonials */}
      <section className="section-begin bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-hero font-bold text-begin-blue mb-6 text-balance">
              What Teachers Are Saying
            </h2>
            <p className="text-body-lg text-begin-blue/80 max-w-3xl mx-auto">
              <strong>Real feedback from educators</strong> who&apos;ve transformed their classrooms with learning profiles
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="card-begin bg-begin-light-blue/10 border border-begin-light-blue/30">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">MR</span>
                </div>
                <div>
                  <div className="font-bold text-begin-blue">Mrs. Rodriguez</div>
                  <div className="text-body text-begin-blue/70">3rd Grade Teacher • Lincoln Elementary</div>
                </div>
              </div>
              <p className="text-body text-begin-blue/90 mb-6 italic leading-relaxed">
                &ldquo;For the first time in 15 years of teaching, I walked into my classroom on Day 1 already knowing that Emma learns best through hands-on activities, that Marcus needs independent thinking time, and that Sofia thrives as a peer helper. The learning profiles completely changed how I set up my classroom and plan my first month of instruction.&rdquo;
              </p>
              <div className="flex items-center gap-2 text-sm text-begin-blue/70">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span>Saved 4 weeks of assessment time</span>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="card-begin bg-begin-teal/5 border border-begin-teal/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">DJ</span>
                </div>
                <div>
                  <div className="font-bold text-begin-blue">Ms. Johnson</div>
                  <div className="text-body text-begin-blue/70">5th Grade Teacher • Riverside Middle</div>
                </div>
              </div>
              <p className="text-body text-begin-blue/90 mb-6 italic leading-relaxed">
                &ldquo;The parent conversations at Back-to-School night were incredible this year. Instead of generic small talk, I could immediately discuss each child&apos;s specific learning strengths with their families. Parents were amazed that I already &apos;knew&apos; their kids so well. It built trust from day one.&rdquo;
              </p>
              <div className="flex items-center gap-2 text-sm text-begin-blue/70">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span>Stronger parent partnerships</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="card-begin bg-purple-50 border border-purple-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">KL</span>
                </div>
                <div>
                  <div className="font-bold text-begin-blue">Mrs. Lee</div>
                  <div className="text-body text-begin-blue/70">1st Grade Teacher • Oakwood Elementary</div>
                </div>
              </div>
              <p className="text-body text-begin-blue/90 mb-6 italic leading-relaxed">
                &ldquo;I had a student who seemed &apos;difficult&apos; in the first week - wouldn&apos;t sit still, couldn&apos;t focus during carpet time. Then I checked his learning profile and saw he&apos;s a strong kinesthetic learner who needs movement to process information. I adjusted my teaching style for him, and he became one of my most engaged students.&rdquo;
              </p>
              <div className="flex items-center gap-2 text-sm text-begin-blue/70">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span>Reduced behavioral challenges</span>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="card-begin bg-green-50 border border-green-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">TC</span>
                </div>
                <div>
                  <div className="font-bold text-begin-blue">Mr. Chen</div>
                  <div className="text-body text-begin-blue/70">4th Grade Teacher • Maplewood Elementary</div>
                </div>
              </div>
              <p className="text-body text-begin-blue/90 mb-6 italic leading-relaxed">
                &ldquo;The detailed classroom strategies for each student were game-changers. I learned that three of my students learn best through peer teaching, so I restructured my math groups to leverage that strength. Test scores improved by 23% compared to last year, and classroom engagement is through the roof.&rdquo;
              </p>
              <div className="flex items-center gap-2 text-sm text-begin-blue/70">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span>23% improvement in test scores</span>
              </div>
            </div>

            {/* Testimonial 5 */}
            <div className="card-begin bg-orange-50 border border-orange-200 lg:col-span-2 max-w-4xl mx-auto">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">SP</span>
                </div>
                <div>
                  <div className="font-bold text-begin-blue">Dr. Sarah Parker</div>
                  <div className="text-body text-begin-blue/70">2nd Grade Teacher • Special Education Specialist • Pine Valley Elementary</div>
                </div>
              </div>
              <p className="text-body text-begin-blue/90 mb-6 italic leading-relaxed text-center">
                &ldquo;As both a classroom teacher and special education specialist, I&apos;ve seen how critical it is to understand each child&apos;s learning profile early. This tool gives regular education teachers the same insights I spend weeks gathering through formal assessments. It&apos;s particularly valuable for identifying students who might need additional support before they fall behind. The research foundation is solid, and the practical applications are immediate.&rdquo;
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-begin-blue/70">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span>Early intervention identification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works for Teachers */}
      <section className="section-begin bg-begin-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-hero font-bold mb-6 text-balance">
              Simple Setup, Powerful Results
            </h2>
            <p className="text-body-lg opacity-90 max-w-3xl mx-auto">
              Get your classroom learning profiles in three simple steps. Setup takes 5 minutes, results last all year.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold">1</span>
              </div>
              <h3 className="text-heading-lg font-bold mb-4">Create Your Classroom</h3>
              <p className="text-white/90 leading-relaxed">Set up your teacher account and add your student roster. Send assessment links to parents via email or share your classroom code.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold">2</span>
              </div>
              <h3 className="text-heading-lg font-bold mb-4">Parents Complete Assessment</h3>
              <p className="text-white/90 leading-relaxed">Parents spend 5 minutes answering research-based questions about their child&apos;s learning preferences, strengths, and classroom behaviors.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold">3</span>
              </div>
              <h3 className="text-heading-lg font-bold mb-4">Get Actionable Insights</h3>
              <p className="text-white/90 leading-relaxed">View detailed learning profiles for each student, plus classroom-wide analytics and specific teaching strategies for every child.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-heading-lg font-bold mb-4">Ready to Transform Your Classroom?</h3>
              <p className="text-white/90 mb-6">Join thousands of teachers who know their students&apos; learning styles from Day 1</p>
              <Link 
                href="/teacher/register"
                className="bg-white text-begin-blue px-8 py-4 rounded-begin text-body-lg font-bold hover:bg-begin-cream transition-all duration-200 inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
              >
                Start Your Free Teacher Account
                <ArrowRight className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="section-begin bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-hero font-bold text-begin-blue mb-6 text-balance">
              Everything You Need for Personalized Learning
            </h2>
            <p className="text-body-lg text-begin-blue/80 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for educators who want to differentiate instruction from Day 1
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="card-begin">
              <div className="bg-begin-teal/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Mail className="h-8 w-8 text-begin-teal" />
              </div>
              <h3 className="text-heading-lg font-bold mb-4 text-begin-blue">Parent Communication Hub</h3>
              <p className="text-body text-begin-blue/70 mb-4 leading-relaxed">
                Send assessment links directly to parent emails, track completion rates, and send automated reminders. 
                No more paper forms or lost assessments.
              </p>
              <ul className="text-sm text-begin-blue/60 space-y-2">
                <li>• Automated email delivery</li>
                <li>• Completion tracking</li>
                <li>• Follow-up reminders</li>
                <li>• Multi-language support</li>
              </ul>
            </div>
            
            <div className="card-begin">
              <div className="bg-begin-blue/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-begin-blue" />
              </div>
              <h3 className="text-heading-lg font-bold mb-4 text-begin-blue">Classroom Analytics Dashboard</h3>
              <p className="text-body text-begin-blue/70 mb-4 leading-relaxed">
                See learning style distribution across your class, identify patterns, and plan differentiated instruction 
                strategies for maximum impact.
              </p>
              <ul className="text-sm text-begin-blue/60 space-y-2">
                <li>• Class-wide learning style breakdown</li>
                <li>• Individual student profiles</li>
                <li>• Grouping recommendations</li>
                <li>• Progress tracking</li>
              </ul>
            </div>
            
            <div className="card-begin">
              <div className="bg-begin-cyan/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <School className="h-8 w-8 text-begin-cyan" />
              </div>
              <h3 className="text-heading-lg font-bold mb-4 text-begin-blue">Day 1 Ready Resources</h3>
              <p className="text-body text-begin-blue/70 mb-4 leading-relaxed">
                Get printable student cards, seating charts based on learning styles, and specific classroom management 
                strategies tailored to each child.
              </p>
              <ul className="text-sm text-begin-blue/60 space-y-2">
                <li>• Printable student profile cards</li>
                <li>• Seating chart recommendations</li>
                <li>• Individual teaching strategies</li>
                <li>• Parent conversation starters</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Success Statistics */}
      <section className="section-begin bg-begin-gray/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-hero font-bold text-begin-blue mb-16 text-balance">
            Proven Results in Real Classrooms
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-card p-8 shadow-sm">
              <div className="text-4xl font-bold text-begin-teal mb-2">2,500+</div>
              <div className="text-body text-begin-blue/70">Teachers Using</div>
              <div className="text-body text-begin-blue/70">Our Platform</div>
            </div>
            
            <div className="bg-white rounded-card p-8 shadow-sm">
              <div className="text-4xl font-bold text-begin-blue mb-2">85%</div>
              <div className="text-body text-begin-blue/70">Report Better</div>
              <div className="text-body text-begin-blue/70">Student Engagement</div>
            </div>
            
            <div className="bg-white rounded-card p-8 shadow-sm">
              <div className="text-4xl font-bold text-begin-teal mb-2">3-4</div>
              <div className="text-body text-begin-blue/70">Weeks of Assessment</div>
              <div className="text-body text-begin-blue/70">Time Saved</div>
            </div>
            
            <div className="bg-white rounded-card p-8 shadow-sm">
              <div className="text-4xl font-bold text-begin-blue mb-2">92%</div>
              <div className="text-body text-begin-blue/70">Would Recommend</div>
              <div className="text-body text-begin-blue/70">to Colleagues</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-begin bg-gradient-to-r from-begin-teal to-begin-cyan text-white">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/20 rounded-2xl p-6 mb-8 max-w-3xl mx-auto">
            <p className="text-white text-body font-medium">
              <Clock className="h-5 w-5 inline mr-2" />
              <strong>Ready for back-to-school?</strong> Set up your classroom learning profiles before your first parent meeting.
            </p>
          </div>
          
          <h2 className="text-hero font-bold mb-6 text-balance">
            Know Your Students Before You Meet Them
          </h2>
          <p className="text-body-lg mb-10 opacity-90 max-w-4xl mx-auto leading-relaxed">
            <strong>Join 2,500+ educators</strong> who start every school year with detailed learning insights for each student. 
            Free forever, research-backed, and ready in 5 minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/teacher/register"
              className="bg-white text-begin-teal px-10 py-5 rounded-begin text-body-lg font-bold hover:bg-begin-cream transition-all duration-200 inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              Create Free Teacher Account
              <ArrowRight className="h-6 w-6" />
            </Link>
            <Link 
              href="/demo"
              className="border-2 border-white text-white px-10 py-5 rounded-begin text-body-lg font-bold hover:bg-white hover:text-begin-teal transition-all duration-200"
            >
              View Sample Profiles
            </Link>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-white/90 text-sm">
              <CheckCircle className="h-4 w-4 inline mr-1" />
              No credit card • <CheckCircle className="h-4 w-4 inline mr-1 ml-4" />
              Instant access • <CheckCircle className="h-4 w-4 inline mr-1 ml-4" />
              Works with all grade levels K-8
            </p>
          </div>
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
            <div className="flex items-center space-x-6">
              <Link href="/teacher/register" className="text-white hover:text-begin-cyan transition-colors">
                Teacher Dashboard
              </Link>
              <Link href="/" className="text-white hover:text-begin-cyan transition-colors">
                For Parents
              </Link>
              <div className="text-body text-white/80">
                © 2025 Begin Learning. Free for all educators.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
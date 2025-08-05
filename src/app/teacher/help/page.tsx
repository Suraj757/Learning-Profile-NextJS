'use client'
import { useState } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  ArrowLeft, 
  Search,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  Lightbulb,
  Users,
  TrendingUp,
  Heart,
  Shield,
  Zap
} from 'lucide-react'
import AuthRequired from '@/components/teacher/AuthRequired'

const helpSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    articles: [
      { title: 'Setting up your first classroom', href: '#setup-classroom', type: 'guide' },
      { title: 'Sending your first assessment', href: '#first-assessment', type: 'guide' },
      { title: 'Understanding learning profiles', href: '#learning-profiles', type: 'concept' },
      { title: 'Teacher dashboard walkthrough', href: '#dashboard-tour', type: 'video' }
    ]
  },
  {
    id: 'features',
    title: 'Core Features',
    icon: BookOpen,
    articles: [
      { title: 'Day 1 Success Kit - Complete Guide', href: '#day1-kit', type: 'guide' },
      { title: 'Student Reference Cards System', href: '#student-cards', type: 'guide' },
      { title: 'At-Risk Early Alerts', href: '#alerts', type: 'guide' },
      { title: 'Parent Communication System', href: '#parent-updates', type: 'guide' },
      { title: 'Classroom Analytics Dashboard', href: '#analytics', type: 'guide' }
    ]
  },
  {
    id: 'parent-communication',
    title: 'Parent Communication',
    icon: Heart,
    articles: [
      { title: 'Best practices for parent outreach', href: '#parent-outreach', type: 'concept' },
      { title: 'Email templates and customization', href: '#email-templates', type: 'guide' },
      { title: 'Sharing assessment results with parents', href: '#sharing-results', type: 'guide' },
      { title: 'Building parent trust and engagement', href: '#parent-engagement', type: 'concept' }
    ]
  },
  {
    id: 'analytics',
    title: 'Data & Analytics',
    icon: TrendingUp,
    articles: [
      { title: 'Reading classroom analytics', href: '#reading-analytics', type: 'guide' },
      { title: 'Identifying at-risk students', href: '#at-risk-identification', type: 'concept' },
      { title: 'Seating arrangement recommendations', href: '#seating', type: 'guide' },
      { title: 'Exporting and sharing reports', href: '#export-reports', type: 'guide' }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: Shield,
    articles: [
      { title: 'Students can\'t access assessments', href: '#access-issues', type: 'troubleshoot' },
      { title: 'Parent not receiving emails', href: '#email-issues', type: 'troubleshoot' },
      { title: 'Assessment results not showing', href: '#results-issues', type: 'troubleshoot' },
      { title: 'Technical requirements and browser support', href: '#tech-requirements', type: 'guide' }
    ]
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    icon: Lightbulb,
    articles: [
      { title: 'Back-to-school implementation timeline', href: '#implementation', type: 'concept' },
      { title: 'Maximizing parent response rates', href: '#response-rates', type: 'concept' },
      { title: 'Using learning profiles in lesson planning', href: '#lesson-planning', type: 'concept' },
      { title: 'Peer collaboration and team teaching', href: '#collaboration', type: 'concept' }
    ]
  }
]

const faqs = [
  {
    question: 'How long does it take for parents to complete the assessment?',
    answer: 'Most parents complete the learning profile assessment in 5-7 minutes. The assessment is designed to be quick but comprehensive, focusing on the most important aspects of their child\'s learning preferences.'
  },
  {
    question: 'Can I customize the assessment questions?',
    answer: 'The core assessment questions are research-based and standardized to ensure reliable results. However, you can add custom questions in your communication templates and follow-up surveys.'
  },
  {
    question: 'What if a parent doesn\'t respond to the assessment invitation?',
    answer: 'We provide automated reminder templates and best practices for follow-up communication. You can also use the phone call scripts in the Parent Communication section to reach out directly.'
  },
  {
    question: 'How accurate are the learning profile results?',
    answer: 'Our assessments are based on validated educational psychology research and have been tested with over 50,000 students. The profiles provide reliable insights when used as intended - as a starting point for understanding each child.'
  },
  {
    question: 'Can I share results with other teachers or administrators?',
    answer: 'Yes, you can export classroom reports and individual profiles. However, always follow your school\'s privacy policies regarding student data sharing.'
  },
  {
    question: 'Is there a limit to how many students I can assess?',
    answer: 'No, there are no limits on the number of students you can assess. The platform is designed to scale with your classroom size and needs.'
  }
]

export default function TeacherHelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const getArticleIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4 text-red-500" />
      case 'guide': return <FileText className="h-4 w-4 text-begin-teal" />
      case 'concept': return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case 'troubleshoot': return <Shield className="h-4 w-4 text-orange-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredSections = helpSections.map(section => ({
    ...section,
    articles: section.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.articles.length > 0 || searchQuery === '')

  return (
    <AuthRequired>
      <div className="min-h-screen bg-begin-cream">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-begin-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/teacher/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-begin-blue">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Dashboard</span>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-begin-blue" />
                <span className="text-xl font-bold text-begin-blue">Help Center</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-begin-blue mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-begin-blue/70 mb-8 max-w-2xl mx-auto">
              Find guides, tutorials, and answers to make the most of your learning profile platform
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles, guides, or features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-begin-teal focus:border-transparent text-lg"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Link href="#getting-started" className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <Zap className="h-8 w-8 text-begin-teal mx-auto mb-2" />
                <div className="font-semibold text-begin-blue">Quick Start</div>
                <div className="text-sm text-begin-blue/70">Get up and running</div>
              </Link>
              <Link href="#features" className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <BookOpen className="h-8 w-8 text-begin-teal mx-auto mb-2" />
                <div className="font-semibold text-begin-blue">Feature Guides</div>
                <div className="text-sm text-begin-blue/70">Learn core features</div>
              </Link>
              <Link href="#contact" className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <MessageCircle className="h-8 w-8 text-begin-teal mx-auto mb-2" />
                <div className="font-semibold text-begin-blue">Contact Support</div>
                <div className="text-sm text-begin-blue/70">Get personal help</div>
              </Link>
              <Link href="#best-practices" className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <Lightbulb className="h-8 w-8 text-begin-teal mx-auto mb-2" />
                <div className="font-semibold text-begin-blue">Best Practices</div>
                <div className="text-sm text-begin-blue/70">Expert tips</div>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Help Sections */}
              {filteredSections.map((section) => {
                const Icon = section.icon
                const isExpanded = expandedSection === section.id
                
                return (
                  <div key={section.id} className="card-begin">
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-begin-teal" />
                        <h2 className="text-xl font-bold text-begin-blue">{section.title}</h2>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-begin-blue/50" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-begin-blue/50" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="px-6 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {section.articles.map((article) => (
                            <Link
                              key={article.title}
                              href={article.href}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-begin-cream/30 transition-colors group"
                            >
                              {getArticleIcon(article.type)}
                              <span className="text-begin-blue group-hover:text-begin-teal transition-colors">
                                {article.title}
                              </span>
                              <ExternalLink className="h-3 w-3 text-begin-blue/30 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* FAQ Section */}
              <div className="card-begin p-6" id="faq">
                <h2 className="text-2xl font-bold text-begin-blue mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="font-medium text-begin-blue">{faq.question}</span>
                        {expandedFaq === index ? (
                          <ChevronDown className="h-4 w-4 text-begin-blue/50" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-begin-blue/50" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 pb-4">
                          <p className="text-begin-blue/70">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Support */}
              <div className="card-begin p-6" id="contact">
                <h3 className="text-lg font-bold text-begin-blue mb-4">Need More Help?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-begin-teal mt-0.5" />
                    <div>
                      <div className="font-medium text-begin-blue">Email Support</div>
                      <div className="text-sm text-begin-blue/70">Get help within 24 hours</div>
                      <a href="mailto:support@beginlearning.com" className="text-sm text-begin-teal hover:underline">
                        support@beginlearning.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MessageCircle className="h-5 w-5 text-begin-teal mt-0.5" />
                    <div>
                      <div className="font-medium text-begin-blue">Live Chat</div>
                      <div className="text-sm text-begin-blue/70">Monday-Friday, 9am-5pm EST</div>
                      <button className="text-sm text-begin-teal hover:underline">
                        Start chat
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-begin-teal mt-0.5" />
                    <div>
                      <div className="font-medium text-begin-blue">Phone Support</div>
                      <div className="text-sm text-begin-blue/70">For urgent issues</div>
                      <a href="tel:1-800-BEGIN-ED" className="text-sm text-begin-teal hover:underline">
                        1-800-BEGIN-ED
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="card-begin p-6">
                <h3 className="text-lg font-bold text-begin-blue mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <Link href="/teacher/send-assessment" className="block text-begin-teal hover:underline text-sm">
                    → Send your first assessment
                  </Link>
                  <Link href="/teacher/day1-kit" className="block text-begin-teal hover:underline text-sm">
                    → Day 1 Success Kit
                  </Link>
                  <Link href="/teacher/analytics" className="block text-begin-teal hover:underline text-sm">
                    → View classroom analytics
                  </Link>
                  <Link href="/teacher/settings" className="block text-begin-teal hover:underline text-sm">
                    → Account settings
                  </Link>
                </div>
              </div>

              {/* Feature Updates */}
              <div className="card-begin p-6">
                <h3 className="text-lg font-bold text-begin-blue mb-4">What's New</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-begin-teal rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-begin-blue text-sm">Parent Updates System</div>
                      <div className="text-xs text-begin-blue/70">Build stronger parent connections</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-begin-teal rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-begin-blue text-sm">At-Risk Early Alerts</div>
                      <div className="text-xs text-begin-blue/70">Proactive student support</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-begin-teal rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-begin-blue text-sm">Enhanced Analytics</div>
                      <div className="text-xs text-begin-blue/70">Deeper classroom insights</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthRequired>
  )
}
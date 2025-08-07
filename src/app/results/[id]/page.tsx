'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Share, Download, Star, ArrowRight, Sparkles, MessageSquare, Calendar, Target, CheckCircle, Clock, Mail, Phone, Home, School, Lightbulb, TrendingUp, Award, Users, Play, Book, Palette, Brain, Heart, Eye, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import EnhancedContentRecommendations from '@/components/content/EnhancedContentRecommendations'
import { beginContentService } from '@/lib/content-recommendation-service'

interface ProfileData {
  id: string
  childName: string
  grade: string
  scores: Record<string, number>
  personalityLabel: string
  description: string
  createdAt: string
}

export default function ResultsPage() {
  const params = useParams()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [enhancedRecommendations, setEnhancedRecommendations] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let response = await fetch(`/api/profiles/${params.id}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          
          // Check if this is our client-side fallback signal
          if (errorData.useClientFallback) {
            // Try localStorage first (profile-specific)
            const localProfile = localStorage.getItem(`profile_${params.id}`)
            if (localProfile) {
              const profile = JSON.parse(localProfile)
              const transformedProfile: ProfileData = {
                id: profile.id,
                childName: profile.child_name,
                grade: profile.grade_level || profile.grade || '3rd Grade',
                scores: profile.scores,
                personalityLabel: profile.personality_label,
                description: profile.description || 'A unique learner with special strengths and talents.',
                createdAt: profile.created_at || new Date().toISOString()
              }
              setProfileData(transformedProfile)
              setLoading(false)
              return
            }
            
            // Fall back to sessionStorage (latest profile)
            const latestProfile = sessionStorage.getItem('latestProfile')
            if (latestProfile) {
              const data = JSON.parse(latestProfile)
              const transformedProfile: ProfileData = {
                id: data.id,
                childName: data.childName,
                grade: data.grade || '3rd Grade',
                scores: data.scores,
                personalityLabel: data.personalityLabel,
                description: data.description,
                createdAt: data.createdAt || new Date().toISOString()
              }
              setProfileData(transformedProfile)
              setLoading(false)
              return
            }
          }
          
          // Try sample profiles as fallback
          response = await fetch(`/api/sample-profiles/${params.id}`)
          
          if (response.ok) {
            const { profile } = await response.json()
            // Transform sample profile to match interface
            const transformedProfile: ProfileData = {
              id: profile.id,
              childName: profile.child_name,
              grade: profile.grade || profile.grade_level || '3rd Grade',
              scores: profile.scores,
              personalityLabel: profile.personality_label,
              description: profile.description || 'A unique learner with special strengths and talents.',
              createdAt: profile.created_at || new Date().toISOString()
            }
            setProfileData(transformedProfile)
            setLoading(false)
            return
          }
          
          setLoading(false)
          return
        }
        
        const { profile } = await response.json()
        
        // Transform the API response to match our interface
        const transformedProfile: ProfileData = {
          id: profile.id,
          childName: profile.child_name,
          grade: profile.grade || profile.grade_level || '3rd Grade',
          scores: profile.scores,
          personalityLabel: profile.personality_label,
          description: profile.description || 'A unique learner with special strengths and talents.',
          createdAt: profile.created_at || new Date().toISOString()
        }
        
        setProfileData(transformedProfile)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching profile:', error)
        
        // Fallback to sessionStorage if API fails
        const latestProfile = sessionStorage.getItem('latestProfile')
        if (latestProfile) {
          const data = JSON.parse(latestProfile)
          setProfileData(data)
        }
        
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProfile()
    }
  }, [params.id])

  // Load enhanced recommendations when profile data is available
  useEffect(() => {
    const loadEnhancedRecommendations = async () => {
      if (profileData?.scores && profileData?.personalityLabel) {
        try {
          const learningProfile = {
            personality_label: profileData.personalityLabel,
            scores: profileData.scores
          }
          const recs = await beginContentService.getQuickRecommendationSummary(learningProfile)
          setEnhancedRecommendations(recs)
        } catch (error) {
          console.error('Error loading enhanced recommendations:', error)
        }
      }
    }
    
    loadEnhancedRecommendations()
  }, [profileData])

  // Get age-appropriate grade level activities
  const getGradeBasedAge = (grade: string) => {
    const gradeMap: Record<string, number> = {
      'Pre-K': 4,
      'Kindergarten': 5,
      '1st Grade': 6,
      '2nd Grade': 7,
      '3rd Grade': 8,
      '4th Grade': 9,
      '5th Grade': 10,
      '6th Grade': 11,
      '7th Grade': 12,
      '8th Grade': 13
    }
    return gradeMap[grade] || 7
  }

  // Get specific daily activities for this child
  const getDailyActivities = (personalityLabel: string, scores: Record<string, number>, grade: string, childName: string) => {
    const age = getGradeBasedAge(grade)
    
    const activities = {
      'Creative Collaborator': {
        today: [
          `Create a story together about ${childName}'s favorite animal (${age < 8 ? '10 minutes' : '15 minutes'})`,
          `Build something with blocks/LEGOs while discussing the plan (${age < 8 ? '15 minutes' : '20 minutes'})`,
          `Let ${childName} help plan tomorrow's activities by drawing or writing ideas`
        ],
        thisWeek: [
          `Start a family art project that everyone contributes to over the week`,
          `Have ${childName} teach you something they learned at school`,
          `Visit a local art museum, library, or creative space together`,
          `Start a bedtime story tradition where you take turns adding to the story`
        ]
      },
      'Analytical Thinker': {
        today: [
          `Ask ${childName} to explain how something works (their favorite toy, app, or game)`,
          `Do a ${age < 8 ? 'simple' : 'challenging'} puzzle together while talking through the strategy`,
          `Let them organize something (books, toys, their backpack) their own way`
        ],
        thisWeek: [
          `Start a weekly "How does it work?" exploration (pick one thing each week)`,
          `Introduce a age-appropriate logic game or brain teaser`,
          `Let ${childName} plan a small project (organizing their room, planning a meal)`,
          `Visit a science museum or do a simple science experiment at home`
        ]
      },
      'Social Connector': {
        today: [
          `Have a 10-minute conversation about ${childName}'s friends and what they like about them`,
          `Let them call/video chat with a grandparent, cousin, or friend`,
          `Ask them to help with a task that involves working together`
        ],
        thisWeek: [
          `Arrange a playdate or social activity with a friend`,
          `Have ${childName} help plan a family activity`,
          `Encourage them to write a letter or draw a picture for someone they care about`,
          `Practice social skills through role-playing different scenarios`
        ]
      },
      'Independent Explorer': {
        today: [
          `Give ${childName} a choice between two activities and let them decide`,
          `Set up a "exploration station" with books, materials, or tools they can investigate alone`,
          `Ask them to teach you something new they discovered recently`
        ],
        thisWeek: [
          `Let them choose and plan one family outing this week`,
          `Introduce a new hobby or skill they can practice independently`,
          `Create a "learning menu" where they can choose what to explore each day`,
          `Encourage them to start a collection or research project on their favorite topic`
        ]
      },
      'Confident Builder': {
        today: [
          `Give ${childName} a building or creation challenge they can complete successfully`,
          `Ask them to show you something they're proud of and explain why it's important`,
          `Let them lead a family activity or game where they feel confident`
        ],
        thisWeek: [
          `Set up opportunities for ${childName} to help younger children or pets`,
          `Encourage them to try one new thing while maintaining their comfort zone`,
          `Create a success journal where they record daily wins`,
          `Plan activities that build on their existing strengths and interests`
        ]
      }
    }
    
    return activities[personalityLabel as keyof typeof activities] || activities['Creative Collaborator']
  }

  // Get specific teacher communication templates
  const getTeacherCommunication = (personalityLabel: string, scores: Record<string, number>, childName: string, grade: string) => {
    const topStrength = Object.entries(scores).sort(([,a], [,b]) => b - a)[0][0]
    const developingArea = Object.entries(scores).sort(([,a], [,b]) => a - b)[0][0]
    
    return {
      emailTemplate: `Subject: ${childName}'s Learning Profile - Let's Partner for Success!

Dear [Teacher's Name],

I'm excited for ${childName} to be in your ${grade} class this year! I recently completed a learning profile assessment and discovered that ${childName} is a "${personalityLabel}" learner.

Here are the key insights that might help you connect with ${childName}:

🌟 STRONGEST AREA: ${topStrength}
${childName} thrives when they can ${topStrength === 'Communication' ? 'share ideas verbally, explain their thinking, and engage in discussions' : topStrength === 'Creative Innovation' ? 'express creativity, try new approaches, and think outside the box' : topStrength === 'Collaboration' ? 'work with others, contribute to team efforts, and help classmates' : topStrength === 'Critical Thinking' ? 'analyze problems, ask questions, and explore how things work' : topStrength === 'Content' ? 'connect learning to their interests and see real-world applications' : 'build confidence through achievable challenges and positive reinforcement'}.

📈 DEVELOPING AREA: ${developingArea}
${childName} is working on ${developingArea.toLowerCase()} skills. At home, we're supporting this by [you can add specific examples].

❓ Questions for our first meeting:
• How do you typically support ${personalityLabel.toLowerCase()} learners in your classroom?
• What classroom accommodations might help ${childName} shine?
• How can I reinforce your classroom strategies at home?
• When would be a good time to check in on ${childName}'s progress?

I'm committed to partnering with you to make this ${childName}'s best school year yet!

Best regards,
[Your Name]
[Your Phone] | [Your Email]

P.S. I'm happy to share the full learning profile report if you'd find it helpful!`,
      
      conferencePoints: [
        `"${childName} is a ${personalityLabel} learner - here's what that means for the classroom..."`,
        `"Their strongest area is ${topStrength}. How can we leverage this to support other areas?"`,
        `"We're working on ${developingArea} at home. What strategies work best in your classroom?"`,
        `"What specific accommodations would help ${childName} succeed?"`,
        `"How do you prefer to communicate about ${childName}'s progress?"`,
        `"What signs should I watch for at home that indicate ${childName} needs extra support?"`
      ],
      
      accommodationRequests: [
        topStrength === 'Communication' ? 'Opportunities to explain thinking verbally before writing' : 'Written reflection after group discussions',
        topStrength === 'Creative Innovation' ? 'Alternative project formats that allow creative expression' : 'Structured creative time within assignments',
        topStrength === 'Collaboration' ? 'Regular partner or small group work opportunities' : 'Structured peer interaction during lessons',
        topStrength === 'Critical Thinking' ? 'Extension questions and "what if" scenarios' : 'Step-by-step problem-solving support',
        'Regular check-ins to ensure understanding before moving forward',
        'Advance notice of major changes in routine or expectations'
      ]
    }
  }

  // Get Begin product recommendations with specific WHY explanations
  const getBeginRecommendations = (personalityLabel: string, scores: Record<string, number>, grade: string, childName: string) => {
    const age = getGradeBasedAge(grade)
    const topStrengths = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([category]) => category)
    
    const products = []
    
    if (scores['Creative Innovation'] >= 4) {
      products.push({
        product: 'Begin Creative Arts & Storytelling Kit',
        description: `Perfect for ${childName} because creative learners need multiple ways to express their ideas`,
        specificWhy: `Since ${childName} scored ${(Number(scores['Creative Innovation']) || 0).toFixed(1)}/5.0 in Creative Innovation, they'll love the open-ended art projects that let them create their own stories and characters`,
        activities: [`Create illustrated stories about their daily adventures`, `Design and build 3D story scenes`, `Make comic strips about family memories`],
        icon: Palette,
        ageAppropriate: age >= 4
      })
    }
    
    if (scores['Communication'] >= 4) {
      products.push({
        product: 'Begin Interactive Story Builder',
        description: `Ideal for ${childName} because they love to share ideas and explain their thinking`,
        specificWhy: `With a ${(Number(scores['Communication']) || 0).toFixed(1)}/5.0 Communication score, ${childName} will thrive with tools that let them tell stories and express complex ideas`,
        activities: [`Record their own story narrations`, `Create choose-your-own-adventure stories`, `Interview family members and create story podcasts`],
        icon: MessageSquare,
        ageAppropriate: age >= 5
      })
    }
    
    if (scores['Critical Thinking'] >= 4) {
      products.push({
        product: 'Begin Logic & Problem-Solving Games',
        description: `Perfect match for ${childName}'s analytical mind and love of figuring things out`,
        specificWhy: `Their ${(Number(scores['Critical Thinking']) || 0).toFixed(1)}/5.0 Critical Thinking score shows they need challenges that make them think deeply and solve complex problems`,
        activities: [`Multi-step strategy games that build logical reasoning`, `"How it works" exploration activities`, `Pattern recognition challenges with real-world applications`],
        icon: Brain,
        ageAppropriate: age >= 6
      })
    }
    
    if (scores['Collaboration'] >= 4) {
      products.push({
        product: 'Begin Family Learning Adventures',
        description: `Designed for ${childName} because they learn best when working with others`,
        specificWhy: `With a ${(Number(scores['Collaboration']) || 0).toFixed(1)}/5.0 Collaboration score, ${childName} needs activities that involve the whole family working together`,
        activities: [`Family cooking projects with math and science`, `Collaborative art projects that span multiple days`, `Family reading challenges with discussion guides`],
        icon: Users,
        ageAppropriate: age >= 4
      })
    }
    
    if (scores['Confidence'] >= 4) {
      products.push({
        product: 'Begin Confidence Building Challenges',
        description: `Tailored for ${childName} to build on their natural confidence and leadership abilities`,
        specificWhy: `Their ${(Number(scores['Confidence']) || 0).toFixed(1)}/5.0 Confidence score shows they're ready for activities that let them teach, lead, and showcase their abilities`,
        activities: [`Leadership games where they guide family activities`, `"Teaching moments" where they explain concepts to others`, `Confidence-building challenges with clear success markers`],
        icon: Award,
        ageAppropriate: age >= 5
      })
    }
    
    // Ensure we have at least 2-3 recommendations
    if (products.length < 2) {
      products.push({
        product: 'Begin Adaptive Learning Kit',
        description: `Customized to ${childName}'s unique learning profile`,
        specificWhy: `This kit adapts to ${childName}'s strengths in ${topStrengths.join(' and ')} while gently building skills in other areas`,
        activities: [`Personalized learning games that adjust to their pace`, `Progress tracking that celebrates their unique growth`, `Family activities that build on their natural interests`],
        icon: Star,
        ageAppropriate: true
      })
    }
    
    return products.filter(p => p.ageAppropriate).slice(0, 3)
  }

  // Get month-by-month development plan
  const getDevelopmentPlan = (personalityLabel: string, scores: Record<string, number>, childName: string) => {
    const developingAreas = Object.entries(scores)
      .filter(([,score]) => score < 4)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 2)
      .map(([category]) => category)
    
    const currentMonth = new Date().toLocaleString('default', { month: 'long' })
    const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('default', { month: 'long' })
    const thirdMonth = new Date(new Date().setMonth(new Date().getMonth() + 2)).toLocaleString('default', { month: 'long' })
    
    return {
      thisMonth: {
        focus: `Building confidence in ${developingAreas[0]?.toLowerCase() || 'foundational skills'}`,
        goals: [
          `${childName} will try one new ${developingAreas[0]?.toLowerCase() || 'learning'} activity each week`,
          `Practice celebrating small wins in challenging areas`,
          `Establish consistent encouragement routines`
        ],
        watchFor: [
          `Increased willingness to try ${developingAreas[0]?.toLowerCase() || 'new'} activities`,
          `Less frustration when facing challenges`,
          `Asking for help when needed`
        ]
      },
      nextMonth: {
        focus: `Expanding skills in ${developingAreas[1]?.toLowerCase() || 'secondary focus areas'}`,
        goals: [
          `Combine ${childName}'s strengths with developing areas`,
          `Introduce peer learning opportunities`,
          `Track progress with simple, visual methods`
        ],
        watchFor: [
          `Using strengths to tackle weaker areas`,
          `Improved persistence with difficult tasks`,
          `Showing pride in progress made`
        ]
      },
      longTerm: {
        focus: `Integration and mastery across all learning areas`,
        goals: [
          `${childName} confidently uses all learning strategies`,
          `Develops meta-cognitive awareness of their learning`,
          `Becomes an advocate for their own learning needs`
        ],
        reassessTime: `Plan to reassess ${childName}'s learning profile in ${thirdMonth} to track growth`
      }
    }
  }

  const copyEmailToClipboard = (emailText: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(emailText).then(() => {
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-begin-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-begin-cream flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-begin-blue mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find this learning profile. It may have expired or been removed.</p>
          <Link href="/assessment/start" className="btn-begin-primary">
            Create New Profile
          </Link>
        </div>
      </div>
    )
  }

  // Prepare data for radar chart
  const radarData = Object.entries(profileData.scores).map(([category, score]) => ({
    category: category.replace(' ', '\n'), // Break long category names
    score: score,
    fullMark: 5
  }))

  // Get strength level for each category
  const getStrengthLevel = (score: number) => {
    if (score >= 4.5) return { level: 'High Strength', color: 'text-green-600', bg: 'bg-green-100' }
    if (score >= 3.5) return { level: 'Developing', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { level: 'Emerging', color: 'text-blue-600', bg: 'bg-blue-100' }
  }

  const dailyActivities = getDailyActivities(profileData.personalityLabel, profileData.scores, profileData.grade, profileData.childName)
  const teacherComm = getTeacherCommunication(profileData.personalityLabel, profileData.scores, profileData.childName, profileData.grade)
  const beginRecommendations = getBeginRecommendations(profileData.personalityLabel, profileData.scores, profileData.grade, profileData.childName)
  const developmentPlan = getDevelopmentPlan(profileData.personalityLabel, profileData.scores, profileData.childName)

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
              <button className="btn-begin-secondary flex items-center gap-2">
                <Share className="h-4 w-4" />
                Share
              </button>
              <button className="btn-begin-secondary flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card-begin p-8 mb-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-begin-blue to-begin-teal rounded-2xl p-6 mb-6 max-w-2xl mx-auto relative overflow-hidden">
              {/* Subtle overlay for better text contrast */}
              <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
              <div className="relative z-10">
                <h1 className="text-begin-hero font-bold mb-2 text-white drop-shadow-lg">
                  {profileData.childName}'s Learning Profile
                </h1>
                <div className="flex items-center justify-center gap-2 text-begin-body text-white/95 drop-shadow-md">
                  <Sparkles className="h-5 w-5 drop-shadow-sm" />
                  <span className="font-medium">{profileData.personalityLabel}</span>
                  <Sparkles className="h-5 w-5 drop-shadow-sm" />
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-begin-blue">{profileData.grade}</div>
                <div className="text-sm text-gray-600">Grade Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-begin-teal">6C</div>
                <div className="text-sm text-gray-600">Framework</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-begin-cyan">
                  {Object.values(profileData.scores).filter(score => score >= 4).length}
                </div>
                <div className="text-sm text-gray-600">Strengths</div>
              </div>
            </div>
          </div>

          <div className="bg-begin-cyan/5 p-6 rounded-2xl">
            <p className="text-begin-body text-gray-700 text-center leading-relaxed">
              {profileData.description}
            </p>
          </div>
        </div>

        {/* Immediate Action Plan */}
        <div className="card-begin p-8 mt-8">
          <div className="text-center mb-8">
            <div className="bg-begin-teal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-begin-teal" />
            </div>
            <h2 className="text-begin-heading font-bold text-begin-blue mb-2">
              Your Action Plan: What to Do TODAY
            </h2>
            <p className="text-gray-600">
              Specific activities you can start right now to support {profileData.childName}'s learning
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Today's Activities */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-green-800">Do This Today (Next 2 Hours)</h3>
              </div>
              <div className="space-y-4">
                {dailyActivities.today.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-800">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* This Week's Plan */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  7
                </div>
                <h3 className="text-xl font-bold text-blue-800">This Week's Goals</h3>
              </div>
              <div className="space-y-4">
                {dailyActivities.thisWeek.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-800">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Communication Toolkit */}
        <div className="card-begin p-8 mt-8">
          <div className="text-center mb-8">
            <div className="bg-begin-cyan/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-begin-cyan" />
            </div>
            <h2 className="text-begin-heading font-bold text-begin-blue mb-2">
              Teacher Communication Toolkit
            </h2>
            <p className="text-gray-600">
              Copy-paste templates and talking points to advocate for {profileData.childName}
            </p>
          </div>
          
          <div className="space-y-8">
            {/* Email Template */}
            <div>
              <h3 className="text-lg font-bold text-begin-blue mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Ready-to-Send Email Template
              </h3>
              <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-begin-teal">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Copy this email and customize with your teacher's name</span>
                  <button 
                    onClick={() => copyEmailToClipboard(teacherComm.emailTemplate)}
                    className="btn-begin-secondary text-xs px-3 py-1 flex items-center gap-2"
                  >
                    {copiedEmail ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedEmail ? 'Copied!' : 'Copy Email'}
                  </button>
                </div>
                <div className="text-sm text-gray-800 whitespace-pre-line font-mono bg-white p-4 rounded border max-h-64 overflow-y-auto">
                  {teacherComm.emailTemplate}
                </div>
              </div>
            </div>
            
            {/* Conference Talking Points */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-begin-blue mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Parent-Teacher Conference Script
                </h3>
                <div className="space-y-3">
                  {teacherComm.conferencePoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-begin-cyan/5 rounded-xl">
                      <div className="bg-begin-cyan text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-800">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-begin-blue mb-4 flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Accommodation Requests
                </h3>
                <div className="space-y-3">
                  {teacherComm.accommodationRequests.map((request, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-begin-teal/5 rounded-xl">
                      <CheckCircle className="h-5 w-5 text-begin-teal mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-800">{request}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Begin Product Recommendations */}
        <div className="card-begin p-8 mt-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-begin-teal to-begin-cyan w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-begin-heading font-bold text-begin-blue mb-2">
              Perfect Begin Products for {profileData.childName}
            </h2>
            <p className="text-gray-600">
              Each recommendation is specifically chosen based on their learning profile
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {beginRecommendations.map((rec, index) => {
              const IconComponent = rec.icon
              return (
                <div key={index} className="bg-gradient-to-br from-begin-teal/5 to-begin-cyan/5 p-6 rounded-2xl border border-begin-teal/20 hover:border-begin-teal/40 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-begin-teal/10 p-2 rounded-xl">
                      <IconComponent className="h-6 w-6 text-begin-teal" />
                    </div>
                    <h3 className="font-bold text-begin-blue text-lg">{rec.product}</h3>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                    <div className="bg-begin-teal/5 p-3 rounded-xl mb-3">
                      <p className="text-xs font-medium text-begin-teal mb-1">WHY THIS WORKS FOR {profileData.childName.toUpperCase()}:</p>
                      <p className="text-xs text-gray-700">{rec.specificWhy}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">SPECIFIC ACTIVITIES:</p>
                    <ul className="space-y-1">
                      {rec.activities.map((activity, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                          <Play className="h-3 w-3 text-begin-cyan mt-0.5 flex-shrink-0" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button className="btn-begin-primary text-sm w-full">
                    Get This for {profileData.childName}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Enhanced Content Recommendations */}
        {enhancedRecommendations && (
          <div className="mt-8">
            <EnhancedContentRecommendations
              recommendations={enhancedRecommendations}
              studentName={profileData.childName}
              learningProfile={profileData.personalityLabel}
            />
          </div>
        )}

        {/* Development Planning */}
        <div className="card-begin p-8 mt-8">
          <div className="text-center mb-8">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-begin-heading font-bold text-begin-blue mb-2">
              {profileData.childName}'s Growth Roadmap
            </h2>
            <p className="text-gray-600">
              Month-by-month plan to develop their learning potential
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* This Month */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800">This Month</h3>
                  <p className="text-sm text-green-600">{new Date().toLocaleString('default', { month: 'long' })}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-green-800 mb-2">FOCUS:</p>
                <p className="text-sm text-gray-700">{developmentPlan.thisMonth.focus}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-green-800 mb-2">GOALS:</p>
                <ul className="space-y-1">
                  {developmentPlan.thisMonth.goals.map((goal, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <Target className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="text-sm font-medium text-green-800 mb-2">WATCH FOR:</p>
                <ul className="space-y-1">
                  {developmentPlan.thisMonth.watchFor.map((sign, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <Eye className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                      {sign}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Next Month */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-800">Next Month</h3>
                  <p className="text-sm text-blue-600">{new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('default', { month: 'long' })}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-blue-800 mb-2">FOCUS:</p>
                <p className="text-sm text-gray-700">{developmentPlan.nextMonth.focus}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-blue-800 mb-2">GOALS:</p>
                <ul className="space-y-1">
                  {developmentPlan.nextMonth.goals.map((goal, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <Target className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="text-sm font-medium text-blue-800 mb-2">WATCH FOR:</p>
                <ul className="space-y-1">
                  {developmentPlan.nextMonth.watchFor.map((sign, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <Eye className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                      {sign}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Long Term */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-800">Long Term</h3>
                  <p className="text-sm text-purple-600">3+ Months</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-purple-800 mb-2">FOCUS:</p>
                <p className="text-sm text-gray-700">{developmentPlan.longTerm.focus}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-purple-800 mb-2">GOALS:</p>
                <ul className="space-y-1">
                  {developmentPlan.longTerm.goals.map((goal, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <Target className="h-3 w-3 text-purple-600 mt-1 flex-shrink-0" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-purple-100 p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-medium text-purple-800">REASSESSMENT TIME:</p>
                </div>
                <p className="text-sm text-gray-700">{developmentPlan.longTerm.reassessTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Real Examples Section */}
        <div className="card-begin p-8 mt-8">
          <div className="text-center mb-8">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-begin-heading font-bold text-begin-blue mb-2">
              Real Examples: Put This Into Action
            </h2>
            <p className="text-gray-600">
              See exactly how other families like yours have used these insights
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Home Example */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-2xl border border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <Home className="h-6 w-6 text-orange-600" />
                <h3 className="text-lg font-bold text-orange-800">At Home This Weekend</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/70 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    "Since {profileData.childName} is a {profileData.personalityLabel}, try this specific activity this weekend:"
                  </p>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {profileData.personalityLabel === 'Creative Collaborator' 
                        ? `Set up a "family restaurant" where ${profileData.childName} designs the menu, you cook together, and everyone role-plays being customers. This combines their creativity with collaboration while practicing real-world skills.`
                        : profileData.personalityLabel === 'Analytical Thinker'
                        ? `Give ${profileData.childName} a broken household item (old phone, radio, etc.) and let them take it apart to see how it works. Provide simple tools and ask them to explain what they discover. This feeds their analytical nature safely.`
                        : profileData.personalityLabel === 'Social Connector'
                        ? `Have ${profileData.childName} plan and host a "family game night" where they choose games, explain rules, and make sure everyone feels included. This leverages their social strengths while building leadership skills.`
                        : `Create a "choose your own adventure" day where ${profileData.childName} makes all the decisions about family activities, from breakfast to bedtime story. This honors their independence while keeping family connection.`}
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/70 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-800 mb-2">"If it goes well, you'll see:"</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• {profileData.childName} staying engaged longer than usual</li>
                    <li>• Natural learning happening without pressure</li>
                    <li>• Pride and confidence in their abilities</li>
                    <li>• Asking to do similar activities again</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* School Example */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <School className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-bold text-green-800">Tell Your Teacher Exactly This</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/70 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    "Here's exactly what to tell your teacher about {profileData.childName}'s learning style:"
                  </p>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 italic">
                      "{profileData.childName} thrives when they can {profileData.personalityLabel === 'Creative Collaborator' ? 'express ideas through art, storytelling, or building before writing them down' : profileData.personalityLabel === 'Analytical Thinker' ? 'understand the "why" behind concepts and explore cause-and-effect relationships' : profileData.personalityLabel === 'Social Connector' ? 'learn through discussion, peer interaction, and helping others understand concepts' : 'work at their own pace and have choices in how they show their learning'}. 
                      
                      At home, we've noticed they learn best when {profileData.personalityLabel === 'Creative Collaborator' ? 'they can use their hands and imagination' : profileData.personalityLabel === 'Analytical Thinker' ? 'they can ask questions and investigate' : profileData.personalityLabel === 'Social Connector' ? 'they can teach others what they\'ve learned' : 'they feel in control of their learning environment'}. 
                      
                      Would it be possible to {profileData.personalityLabel === 'Creative Collaborator' ? 'sometimes let them draw their ideas before writing, or use creative projects to show understanding' : profileData.personalityLabel === 'Analytical Thinker' ? 'provide extension questions or let them research topics that interest them' : profileData.personalityLabel === 'Social Connector' ? 'use partner work or let them help explain concepts to classmates' : 'offer choices in assignments or provide quiet spaces when they need to focus'}?"
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/70 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-800 mb-2">"If the teacher is receptive, you can add:"</p>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-700">
                      "I have a detailed learning profile report I'd be happy to share. It shows their specific strengths and gives practical classroom strategies. Would that be helpful?"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Radar Chart */}
          <div className="card-begin p-6">
            <h2 className="text-begin-heading font-bold text-begin-blue mb-6 text-center">
              Learning Strengths Overview
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis 
                    dataKey="category" 
                    className="text-sm font-medium"
                    tick={{ fontSize: 12, fill: '#0B3064' }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 5]} 
                    tick={false}
                  />
                  <Radar 
                    name="Score" 
                    dataKey="score" 
                    stroke="#007A72" 
                    fill="#007A72" 
                    fillOpacity={0.2}
                    strokeWidth={3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-gray-600 mt-4">
              Interactive learning profile based on 24 research-backed questions
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="card-begin p-6">
            <h2 className="text-begin-heading font-bold text-begin-blue mb-6">
              Detailed Category Breakdown
            </h2>
            <div className="space-y-4">
              {Object.entries(profileData.scores).map(([category, score]) => {
                const strength = getStrengthLevel(score)
                return (
                  <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-semibold text-begin-blue mb-1">{category}</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-begin-teal h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(score / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {(Number(score) || 0).toFixed(1)}/5.0
                        </span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${strength.bg} ${strength.color}`}>
                      {strength.level}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Reference Card */}
        <div className="card-begin p-8 mt-8 bg-gradient-to-br from-begin-blue/5 to-begin-teal/5 border border-begin-blue/20">
          <div className="text-center mb-6">
            <h2 className="text-begin-heading font-bold text-begin-blue mb-2">
              {profileData.childName}'s Quick Reference Card
            </h2>
            <p className="text-gray-600 text-sm">
              Print this or save to your phone for teacher meetings and daily reference
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-begin-blue mb-2">Learning Type:</h3>
                <p className="text-sm text-gray-800 mb-4">{profileData.personalityLabel}</p>
                
                <h3 className="font-bold text-begin-blue mb-2">Top Strengths:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {Object.entries(profileData.scores)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 2)
                    .map(([category, score]) => (
                      <li key={category}>• {category} ({(Number(score) || 0).toFixed(1)}/5)</li>
                    ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-begin-blue mb-2">They Learn Best When:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {(profileData.personalityLabel === 'Creative Collaborator' 
                    ? ['• They can express ideas creatively', '• Working with others', '• Using hands-on materials']
                    : profileData.personalityLabel === 'Analytical Thinker'
                    ? ['• Understanding "why" behind concepts', '• Having time to process', '• Exploring cause and effect']
                    : profileData.personalityLabel === 'Social Connector'
                    ? ['• Learning through discussion', '• Helping others understand', '• Working in groups']
                    : ['• Having choices in their learning', '• Working at their own pace', '• Feeling in control']
                  ).map((item, i) => <li key={i}>{item}</li>)}
                </ul>
                
                <h3 className="font-bold text-begin-blue mb-2 mt-4">Growth Area:</h3>
                <p className="text-sm text-gray-700">
                  {Object.entries(profileData.scores)
                    .sort(([,a], [,b]) => a - b)[0][0]} 
                  ({Object.entries(profileData.scores)
                    .sort(([,a], [,b]) => (Number(a) || 0) - (Number(b) || 0))[0][1] ? (Number(Object.entries(scores).sort(([,a], [,b]) => (Number(a) || 0) - (Number(b) || 0))[0][1]) || 0).toFixed(1) : '0.0'}/5)
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4 text-center">
              <p className="text-xs text-gray-500">
                {profileData.childName}'s Learning Profile • {profileData.grade} • Created {new Date(profileData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center mt-6 gap-4">
            <button className="btn-begin-secondary flex items-center gap-2 text-sm">
              <Download className="h-4 w-4" />
              Download Reference Card
            </button>
            <button className="btn-begin-secondary flex items-center gap-2 text-sm">
              <Share className="h-4 w-4" />
              Share with Teacher
            </button>
          </div>
        </div>

        {/* Create Another Profile CTA */}
        <div className="text-center mt-12">
          <div className="card-begin p-8 bg-gradient-to-r from-begin-teal/10 to-begin-cyan/10">
            <h3 className="text-begin-heading font-bold text-begin-blue mb-4">
              Have Another Child?
            </h3>
            <p className="text-gray-600 mb-6">
              Every child is unique. Create personalized learning profiles for all your children.
            </p>
            <Link href="/assessment/start" className="btn-begin-primary flex items-center gap-2 mx-auto">
              Create Another Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
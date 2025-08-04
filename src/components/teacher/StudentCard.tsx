'use client'
import { 
  Printer, 
  Mail, 
  Target, 
  AlertTriangle, 
  Zap, 
  MessageCircle,
  Star,
  Users,
  Brain,
  Heart,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface StudentCardProps {
  card: {
    id: number
    child_name: string
    parent_email: string
    learning_style: 'Creative' | 'Analytical' | 'Collaborative' | 'Confident'
    avatar_url?: string
    strengths: string[]
    challenges: string[]
    quick_wins: string[]
    parent_insight: string
    emergency_backup: string
    assessment_results?: {
      id: number
      personality_label: string
      scores: Record<string, number>
      grade_level: string
    }
  }
  onPrint: () => void
  onEmailParent: () => void
}

export default function StudentCard({ card, onPrint, onEmailParent }: StudentCardProps) {
  const styleColors = {
    Creative: {
      bg: 'from-blue-500 to-blue-600',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-500',
      dot: 'bg-blue-500'
    },
    Analytical: {
      bg: 'from-green-500 to-green-600',
      border: 'border-green-200', 
      text: 'text-green-700',
      icon: 'text-green-500',
      dot: 'bg-green-500'
    },
    Collaborative: {
      bg: 'from-purple-500 to-purple-600',
      border: 'border-purple-200',
      text: 'text-purple-700', 
      icon: 'text-purple-500',
      dot: 'bg-purple-500'
    },
    Confident: {
      bg: 'from-orange-500 to-orange-600',
      border: 'border-orange-200',
      text: 'text-orange-700',
      icon: 'text-orange-500', 
      dot: 'bg-orange-500'
    }
  }

  const colors = styleColors[card.learning_style]

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'Creative': return <Zap className="h-5 w-5" />
      case 'Analytical': return <Target className="h-5 w-5" />
      case 'Collaborative': return <Users className="h-5 w-5" />
      case 'Confident': return <Star className="h-5 w-5" />
      default: return <Brain className="h-5 w-5" />
    }
  }

  return (
    <div className={`card-begin student-card border-2 border-gray-100 hover:shadow-lg transition-all duration-200 print:shadow-none print:border print:break-inside-avoid print:mb-6 relative group style-${card.learning_style.toLowerCase()}`}>
      {/* Quick Actions - Hidden in Print */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
        <div className="flex gap-2">
          <Link
            href={`/teacher/student-cards/${card.id}`}
            className="p-2 bg-white rounded-full shadow-md hover:bg-begin-cream transition-colors"
            title="View Full Card"
          >
            <Eye className="h-4 w-4 text-begin-blue/70" />
          </Link>
          <button
            onClick={onPrint}
            className="p-2 bg-white rounded-full shadow-md hover:bg-begin-cream transition-colors"
            title="Print Card"
          >
            <Printer className="h-4 w-4 text-begin-blue/70" />
          </button>
          <button
            onClick={onEmailParent}
            className="p-2 bg-white rounded-full shadow-md hover:bg-begin-cream transition-colors"
            title="Email Parent"
          >
            <Mail className="h-4 w-4 text-begin-blue/70" />
          </button>
        </div>
      </div>

      {/* Card Header */}
      <div className={`bg-gradient-to-r ${colors.bg} text-white p-4 rounded-t-card -m-6 mb-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{card.child_name}</h2>
            <p className="text-white/90 text-sm">{card.assessment_results?.grade_level || 'Grade TBD'}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-white/90">
              {getStyleIcon(card.learning_style)}
              <span className="font-semibold">{card.learning_style}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Strengths */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className={`h-5 w-5 ${colors.icon}`} />
          <h3 className="font-bold text-begin-blue">TOP STRENGTHS</h3>
        </div>
        <div className="space-y-2">
          {card.strengths.slice(0, 3).map((strength, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className={`w-2 h-2 ${colors.dot} rounded-full mt-2 flex-shrink-0`}></div>
              <p className="text-begin-blue text-sm leading-relaxed">{strength}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Potential Challenges */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="font-bold text-begin-blue">POTENTIAL CHALLENGES</h3>
        </div>
        <div className="space-y-2">
          {card.challenges.slice(0, 2).map((challenge, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-begin-blue text-sm leading-relaxed">{challenge}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Wins */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-green-600" />
          <h3 className="font-bold text-green-800">QUICK WINS (Try These First!)</h3>
        </div>
        <div className="space-y-2">
          {card.quick_wins.slice(0, 2).map((win, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                {index + 1}
              </span>
              <p className="text-green-800 text-sm font-medium leading-relaxed">{win}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Parent Insight */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="h-5 w-5 text-begin-teal" />
          <h3 className="font-bold text-begin-blue">PARENT INSIGHT</h3>
        </div>
        <div className="bg-begin-teal/5 border-l-4 border-begin-teal p-3 rounded-r-card">
          <p className="text-begin-blue text-sm italic leading-relaxed">"{card.parent_insight}"</p>
        </div>
      </div>

      {/* Emergency Backup Plan */}
      <div className="bg-red-50 border border-red-200 rounded-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-5 w-5 text-red-600" />
          <h3 className="font-bold text-red-800">EMERGENCY BACKUP PLAN</h3>
        </div>
        <div className="bg-red-100 border border-red-200 rounded p-3">
          <p className="text-red-800 text-sm font-medium">
            <span className="font-bold">When struggling:</span> {card.emergency_backup}
          </p>
        </div>
      </div>

      {/* Card Footer - Reference Info */}
      <div className="mt-4 pt-4 border-t border-begin-gray/30">
        <div className="flex justify-between items-center text-xs text-begin-blue/60">
          <span>Begin Learning Profile</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
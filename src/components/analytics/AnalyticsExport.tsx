'use client'
import { useState } from 'react'
import { 
  Download, 
  FileText, 
  Image, 
  Mail, 
  Printer,
  Share2,
  Calendar,
  CheckSquare
} from 'lucide-react'
import { SampleProfile } from '@/lib/sample-profiles'

interface AnalyticsExportProps {
  students: SampleProfile[]
  classroomName: string
  grade: string
  onClose?: () => void
}

type ExportFormat = 'pdf' | 'csv' | 'json' | 'png' | 'email'
type ExportContent = 'overview' | 'individual' | 'comparison' | 'progress' | 'all'

export default function AnalyticsExport({ 
  students, 
  classroomName, 
  grade,
  onClose 
}: AnalyticsExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf')
  const [selectedContent, setSelectedContent] = useState<ExportContent>('overview')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeRecommendations, setIncludeRecommendations] = useState(true)
  const [includeIndividualProfiles, setIncludeIndividualProfiles] = useState(false)
  const [emailRecipient, setEmailRecipient] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const exportOptions = {
    pdf: {
      icon: FileText,
      label: 'PDF Report',
      description: 'Comprehensive report with charts and insights',
      supports: ['overview', 'individual', 'comparison', 'progress', 'all']
    },
    csv: {
      icon: Download,
      label: 'CSV Data',
      description: 'Raw data for further analysis',
      supports: ['overview', 'individual', 'progress']
    },
    json: {
      icon: Download,
      label: 'JSON Data',
      description: 'Structured data for technical use',
      supports: ['overview', 'individual', 'comparison', 'progress', 'all']
    },
    png: {
      icon: Image,
      label: 'Chart Images',
      description: 'Individual chart images for presentations',
      supports: ['overview', 'comparison']
    },
    email: {
      icon: Mail,
      label: 'Email Report',
      description: 'Send report directly to email',
      supports: ['overview', 'all']
    }
  }

  const contentOptions = {
    overview: 'Classroom Overview Dashboard',
    individual: 'Individual Student Profiles',
    comparison: 'Student Comparison Analysis',
    progress: 'Progress Tracking Data',
    all: 'Complete Analytics Package'
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Generate export data based on selections
      const exportData = generateExportData()
      
      switch (selectedFormat) {
        case 'pdf':
          await exportToPDF(exportData)
          break
        case 'csv':
          await exportToCSV(exportData)
          break
        case 'json':
          await exportToJSON(exportData)
          break
        case 'png':
          await exportToPNG()
          break
        case 'email':
          await sendEmailReport(exportData)
          break
      }
      
      if (onClose) onClose()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const generateExportData = () => {
    const baseData = {
      classroom: classroomName,
      grade,
      generatedAt: new Date().toISOString(),
      totalStudents: students.length
    }

    switch (selectedContent) {
      case 'overview':
        return {
          ...baseData,
          type: 'classroom_overview',
          personalityDistribution: students.reduce((acc, s) => {
            acc[s.personalityLabel] = (acc[s.personalityLabel] || 0) + 1
            return acc
          }, {} as Record<string, number>),
          averageScores: calculateAverageScores(),
          riskAssessment: generateRiskAssessment()
        }
      
      case 'individual':
        return {
          ...baseData,
          type: 'individual_profiles',
          students: students.map(student => ({
            name: student.childName,
            personalityLabel: student.personalityLabel,
            scores: student.scores,
            strengths: student.strengths,
            growthAreas: student.growthAreas,
            description: student.description
          }))
        }
      
      case 'comparison':
        return {
          ...baseData,
          type: 'comparison_analysis',
          comparisons: generateComparisonMatrix()
        }
      
      case 'progress':
        return {
          ...baseData,
          type: 'progress_tracking',
          timeline: generateProgressTimeline(),
          completionRates: generateCompletionRates()
        }
      
      case 'all':
        return {
          ...baseData,
          type: 'complete_analytics',
          overview: generateExportData(),
          // Include all other data types
        }
      
      default:
        return baseData
    }
  }

  const calculateAverageScores = () => {
    const totals = students.reduce((acc, student) => {
      Object.entries(student.scores).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value
      })
      return acc
    }, {} as Record<string, number>)

    return Object.fromEntries(
      Object.entries(totals).map(([key, total]) => [
        key, 
        (total / students.length).toFixed(2)
      ])
    )
  }

  const generateRiskAssessment = () => {
    return students.map(student => {
      const avgScore = Object.values(student.scores).reduce((sum, score) => sum + score, 0) / 6
      const minScore = Math.min(...Object.values(student.scores))
      
      let riskLevel: 'low' | 'medium' | 'high' = 'low'
      if (avgScore < 3.0 || minScore < 2.5) riskLevel = 'high'
      else if (avgScore < 3.5 || minScore < 3.0) riskLevel = 'medium'
      
      return {
        student: student.childName,
        riskLevel,
        avgScore: avgScore.toFixed(2),
        minScore: minScore.toFixed(2),
        areasForGrowth: Object.entries(student.scores)
          .filter(([_, score]) => score < 3.5)
          .map(([area, _]) => area)
      }
    })
  }

  const generateComparisonMatrix = () => {
    // Generate pairwise comparisons for top combinations
    const comparisons = []
    for (let i = 0; i < Math.min(students.length, 3); i++) {
      for (let j = i + 1; j < Math.min(students.length, 3); j++) {
        const student1 = students[i]
        const student2 = students[j]
        
        comparisons.push({
          student1: student1.childName,
          student2: student2.childName,
          compatibility: calculateCompatibility(student1, student2),
          complementarySkills: findComplementarySkills(student1, student2)
        })
      }
    }
    return comparisons
  }

  const calculateCompatibility = (student1: SampleProfile, student2: SampleProfile) => {
    // Simple compatibility calculation
    const scoreDiffs = Object.keys(student1.scores).map(key => 
      Math.abs(student1.scores[key] - student2.scores[key])
    )
    const avgDiff = scoreDiffs.reduce((sum, diff) => sum + diff, 0) / scoreDiffs.length
    return Math.max(0, 10 - avgDiff * 2).toFixed(1)
  }

  const findComplementarySkills = (student1: SampleProfile, student2: SampleProfile) => {
    return Object.entries(student1.scores)
      .filter(([key, score1]) => {
        const score2 = student2.scores[key]
        return Math.abs(score1 - score2) >= 1.5
      })
      .map(([key, _]) => key)
  }

  const generateProgressTimeline = () => {
    // Mock progress data - in real app would come from actual assessments
    return students.map(student => ({
      student: student.childName,
      assessmentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      completed: Math.random() > 0.2,
      completionTime: Math.floor(Math.random() * 20) + 10
    }))
  }

  const generateCompletionRates = () => {
    const completed = students.filter(() => Math.random() > 0.2).length
    return {
      total: students.length,
      completed,
      pending: students.length - completed,
      rate: ((completed / students.length) * 100).toFixed(1)
    }
  }

  const exportToPDF = async (data: any) => {
    // In a real app, this would generate a PDF using a library like jsPDF or Puppeteer
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    downloadFile(blob, `${classroomName}-analytics-${new Date().toISOString().split('T')[0]}.json`)
  }

  const exportToCSV = async (data: any) => {
    let csvContent = ''
    
    if (selectedContent === 'individual') {
      // CSV format for individual student data
      csvContent = 'Name,Personality Type,Communication,Collaboration,Content,Critical Thinking,Creative Innovation,Confidence\n'
      students.forEach(student => {
        csvContent += `${student.childName},${student.personalityLabel},${Object.values(student.scores).join(',')}\n`
      })
    } else {
      // CSV format for overview data
      csvContent = 'Metric,Value\n'
      csvContent += `Total Students,${students.length}\n`
      csvContent += `Generated At,${new Date().toLocaleString()}\n`
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    downloadFile(blob, `${classroomName}-data-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const exportToJSON = async (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    downloadFile(blob, `${classroomName}-analytics-${new Date().toISOString().split('T')[0]}.json`)
  }

  const exportToPNG = async () => {
    // In a real app, this would capture chart elements as images
    alert('Chart export feature would capture current visualizations as PNG files.')
  }

  const sendEmailReport = async (data: any) => {
    // In a real app, this would send via email service
    if (!emailRecipient) {
      alert('Please enter an email address.')
      return
    }
    alert(`Report would be sent to ${emailRecipient}`)
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const IconComponent = exportOptions[selectedFormat].icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-heading-lg font-bold text-begin-blue">Export Analytics</h3>
          <button
            onClick={onClose}
            className="text-begin-blue/70 hover:text-begin-blue text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <div>
            <h4 className="font-semibold text-begin-blue mb-3">Export Format</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(exportOptions).map(([format, option]) => {
                const OptionIcon = option.icon
                return (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format as ExportFormat)}
                    className={`p-4 border rounded-card text-left transition-colors ${
                      selectedFormat === format
                        ? 'border-begin-teal bg-begin-teal/5'
                        : 'border-begin-gray hover:border-begin-teal/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <OptionIcon className="h-5 w-5 text-begin-teal" />
                      <span className="font-medium text-begin-blue">{option.label}</span>
                    </div>
                    <p className="text-sm text-begin-blue/70">{option.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content Selection */}
          <div>
            <h4 className="font-semibold text-begin-blue mb-3">Content to Export</h4>
            <select
              value={selectedContent}
              onChange={(e) => setSelectedContent(e.target.value as ExportContent)}
              className="w-full px-3 py-2 border border-begin-gray rounded-card"
            >
              {Object.entries(contentOptions)
                .filter(([key]) => exportOptions[selectedFormat].supports.includes(key))
                .map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
            </select>
          </div>

          {/* Options */}
          <div>
            <h4 className="font-semibold text-begin-blue mb-3">Export Options</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="rounded border-begin-gray text-begin-teal focus:ring-begin-teal"
                  disabled={selectedFormat === 'csv'}
                />
                <span className="text-begin-blue">Include charts and visualizations</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeRecommendations}
                  onChange={(e) => setIncludeRecommendations(e.target.checked)}
                  className="rounded border-begin-gray text-begin-teal focus:ring-begin-teal"
                />
                <span className="text-begin-blue">Include teaching recommendations</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeIndividualProfiles}
                  onChange={(e) => setIncludeIndividualProfiles(e.target.checked)}
                  className="rounded border-begin-gray text-begin-teal focus:ring-begin-teal"
                />
                <span className="text-begin-blue">Include individual student profiles</span>
              </label>
            </div>
          </div>

          {/* Email specific options */}
          {selectedFormat === 'email' && (
            <div>
              <h4 className="font-semibold text-begin-blue mb-3">Email Details</h4>
              <input
                type="email"
                placeholder="recipient@school.edu"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                className="w-full px-3 py-2 border border-begin-gray rounded-card"
              />
            </div>
          )}

          {/* Export Summary */}
          <div className="bg-begin-cream/30 p-4 rounded-card">
            <h4 className="font-semibold text-begin-blue mb-2 flex items-center gap-2">
              <IconComponent className="h-4 w-4" />
              Export Summary
            </h4>
            <div className="text-sm text-begin-blue/70 space-y-1">
              <p>Format: {exportOptions[selectedFormat].label}</p>
              <p>Content: {contentOptions[selectedContent]}</p>
              <p>Students: {students.length}</p>
              <p>Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-begin-gray">
            <button
              onClick={onClose}
              className="btn-begin-secondary"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || (selectedFormat === 'email' && !emailRecipient)}
              className="btn-begin-primary flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
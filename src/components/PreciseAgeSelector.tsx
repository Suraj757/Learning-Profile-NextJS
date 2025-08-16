'use client'
import { useState, useEffect } from 'react'
import { Calendar, Clock, Info, AlertCircle } from 'lucide-react'

interface PreciseAgeData {
  years: number
  months: number
  birthDate?: Date
}

interface PreciseAgeSelectorProps {
  onAgeChange: (ageData: PreciseAgeData) => void
  selectedAge?: PreciseAgeData
  className?: string
}

export function PreciseAgeSelector({ onAgeChange, selectedAge, className = '' }: PreciseAgeSelectorProps) {
  const [years, setYears] = useState(selectedAge?.years || 3)
  const [months, setMonths] = useState(selectedAge?.months || 0)
  const [inputMethod, setInputMethod] = useState<'age' | 'birthdate'>('age')
  const [birthDate, setBirthDate] = useState<string>('')
  const [showDevelopmentalInfo, setShowDevelopmentalInfo] = useState(false)

  // Calculate age from birth date
  const calculateAgeFromBirthDate = (birthDateStr: string) => {
    const birth = new Date(birthDateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - birth.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const totalMonths = Math.floor(diffDays / 30.44) // Average days per month
    const calcYears = Math.floor(totalMonths / 12)
    const calcMonths = totalMonths % 12
    
    return { years: calcYears, months: calcMonths }
  }

  // Update age when birth date changes
  useEffect(() => {
    if (inputMethod === 'birthdate' && birthDate) {
      const calculatedAge = calculateAgeFromBirthDate(birthDate)
      setYears(calculatedAge.years)
      setMonths(calculatedAge.months)
    }
  }, [birthDate, inputMethod])

  // Notify parent component of age changes
  useEffect(() => {
    const ageData: PreciseAgeData = {
      years,
      months,
      ...(inputMethod === 'birthdate' && birthDate ? { birthDate: new Date(birthDate) } : {})
    }
    onAgeChange(ageData)
  }, [years, months, birthDate, inputMethod, onAgeChange])

  // Get CLP 2.0 age group display
  const getAgeGroupInfo = () => {
    const totalMonths = years * 12 + months
    
    if (totalMonths < 42) { // < 3.5 years
      return {
        group: '3-4',
        display: '3-4 years old',
        description: 'Preschool age, exploring and learning through play',
        questions: 24, // CLP 2.0: 8 skills × 3 questions
        preferences: 4,
        scoringSystem: 'CLP 2.0',
        color: 'bg-pink-50 border-pink-200 text-pink-700'
      }
    } else if (totalMonths < 66) { // 3.5 - 5.5 years
      return {
        group: '4-5', 
        display: '4-5 years old',
        description: 'Pre-K to Kindergarten, developing school readiness',
        questions: 24, // CLP 2.0: 8 skills × 3 questions
        preferences: 4,
        scoringSystem: 'CLP 2.0',
        color: 'bg-purple-50 border-purple-200 text-purple-700'
      }
    } else if (totalMonths < 84) { // 5.5 - 7 years
      return {
        group: '5-6',
        display: '5-7 years old', 
        description: 'Kindergarten to 1st grade, formal learning begins',
        questions: 24, // CLP 2.0: 8 skills × 3 questions
        preferences: 4,
        scoringSystem: 'CLP 2.0',
        color: 'bg-blue-50 border-blue-200 text-blue-700'
      }
    } else if (totalMonths < 108) { // 7 - 9 years
      return {
        group: '6-8',
        display: '7-9 years old',
        description: '1st to 3rd grade, building foundational academic skills',
        questions: 36, // CLP 2.0: Core + extended questions
        preferences: 4,
        scoringSystem: 'CLP 2.0 Extended',
        color: 'bg-green-50 border-green-200 text-green-700'
      }
    } else if (totalMonths < 132) { // 9 - 11 years
      return {
        group: '8-10',
        display: '9-11 years old',
        description: '3rd to 5th grade, developing complex thinking skills',
        questions: 42, // CLP 2.0: Core + extended questions
        preferences: 4,
        scoringSystem: 'CLP 2.0 Extended',
        color: 'bg-teal-50 border-teal-200 text-teal-700'
      }
    } else {
      return {
        group: '10+',
        display: '11+ years old',
        description: 'Middle school+, advanced academic and social development',
        questions: 45, // CLP 2.0: Full extended question set
        preferences: 4,
        scoringSystem: 'CLP 2.0 Extended',
        color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
      }
    }
  }

  const ageGroupInfo = getAgeGroupInfo()
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 3) // Minimum 3 years old
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 14) // Maximum 14 years old (extended support)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Method Selection */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setInputMethod('age')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            inputMethod === 'age'
              ? 'bg-white text-begin-blue shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          Age in Years & Months
        </button>
        <button
          onClick={() => setInputMethod('birthdate')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            inputMethod === 'birthdate'
              ? 'bg-white text-begin-blue shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Birth Date
        </button>
      </div>

      {/* Age Input Method */}
      {inputMethod === 'age' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years Old
            </label>
            <select
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-begin-teal focus:border-transparent text-lg"
            >
              {Array.from({ length: 11 }, (_, i) => i + 3).map(year => (
                <option key={year} value={year}>{year} years</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Months
            </label>
            <select
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-begin-teal focus:border-transparent text-lg"
            >
              {Array.from({ length: 12 }, (_, i) => i).map(month => (
                <option key={month} value={month}>
                  {month === 0 ? 'No extra months' : `${month} month${month > 1 ? 's' : ''}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Birth Date Input Method */}
      {inputMethod === 'birthdate' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Child's Birth Date
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            min={minDate.toISOString().split('T')[0]}
            max={maxDate.toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-begin-teal focus:border-transparent text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            We'll calculate the exact age for you!
          </p>
        </div>
      )}

      {/* Age Display & Group Information */}
      <div className={`p-4 rounded-xl border-2 ${ageGroupInfo.color}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold mb-1">
              Your child is {years} years and {months} months old
            </h4>
            <p className="text-sm mb-2">{ageGroupInfo.description}</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-current rounded-full"></span>
                Assessment Group: {ageGroupInfo.display}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-current rounded-full"></span>
                {ageGroupInfo.questions} skills + {ageGroupInfo.preferences} preferences
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-current rounded-full"></span>
                {ageGroupInfo.scoringSystem}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowDevelopmentalInfo(!showDevelopmentalInfo)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Developmental Information */}
      {showDevelopmentalInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <h5 className="font-semibold mb-2">About CLP 2.0 Age-Based Assessments</h5>
              <ul className="space-y-1 text-xs">
                <li>• Questions are tailored to your child's developmental stage using the CLP 2.0 framework</li>
                <li>• Assesses 8 key skills: 6Cs + Literacy + Math with precise month-level accuracy</li>
                <li>• Every child develops at their own pace - that's perfectly normal!</li>
                <li>• If your child has special needs, choose the age that best matches their abilities</li>
                <li>• Progressive scoring allows for multiple assessments to build a complete profile</li>
                <li>• You can always retake the assessment as your child grows</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Edge Case Warnings */}
      {years < 3 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Note:</strong> Our assessment is designed for children 3 years and older. 
              For younger children, the questions may not accurately reflect their developmental stage.
            </div>
          </div>
        </div>
      )}
      
      {years > 10 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800">
              <strong>CLP 2.0 Extended Age Range:</strong> Our assessment now covers children up to 14 years using developmentally appropriate questions. 
              The CLP 2.0 Extended framework includes advanced academic and social development measures for middle school students.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PreciseAgeSelector
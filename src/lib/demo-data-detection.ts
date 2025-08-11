// Utility functions to detect and handle demo data vs real data

export interface DataSource {
  type: 'demo' | 'real' | 'mixed'
  confidence: number // 0-1 scale
  indicators: string[]
  totalRecords: number
  realRecords: number
  demoRecords: number
}

export interface ClassroomDataSource extends DataSource {
  classroomName?: string
  teacherEmail?: string
  hasRealStudents: boolean
  hasCompletedAssessments: boolean
}

/**
 * Analyze data source based on various indicators
 */
export function analyzeDataSource(
  classrooms: any[], 
  assignments: any[], 
  teacherEmail?: string
): ClassroomDataSource {
  const indicators: string[] = []
  let demoScore = 0
  let realScore = 0
  
  // Teacher-specific indicators
  if (teacherEmail) {
    if (teacherEmail.includes('demo') || teacherEmail.includes('test')) {
      demoScore += 0.3
      indicators.push('Demo teacher email detected')
    }
    
    if (teacherEmail === 'suraj+1@speakaboos.com') {
      realScore += 0.5
      indicators.push('Real teacher account detected')
    }
  }
  
  // Classroom name indicators
  const classroomNames = classrooms.map(c => c.name?.toLowerCase() || '')
  const hasRealClassroomNames = classroomNames.some(name => 
    !name.includes('demo') && 
    !name.includes('test') && 
    !name.includes('sample')
  )
  
  if (hasRealClassroomNames) {
    realScore += 0.2
    indicators.push('Real classroom names detected')
  } else if (classroomNames.some(name => name.includes('demo'))) {
    demoScore += 0.3
    indicators.push('Demo classroom names detected')
  }
  
  // Assignment/student indicators
  const studentNames = assignments.map(a => a.child_name?.toLowerCase() || '')
  const hasGenericNames = studentNames.some(name => 
    name.includes('demo') || 
    name.includes('test') || 
    name.includes('sample') ||
    name.includes('student')
  )
  
  if (hasGenericNames) {
    demoScore += 0.3
    indicators.push('Generic student names detected')
  }
  
  // Real student name patterns (diverse, realistic names)
  const hasRealisticNames = studentNames.some(name => {
    const parts = name.split(' ')
    return parts.length >= 2 && 
           parts[0].length > 2 && 
           parts[1].length > 2 &&
           !name.includes('student') &&
           !name.includes('child')
  })
  
  if (hasRealisticNames) {
    realScore += 0.2
    indicators.push('Realistic student names detected')
  }
  
  // Assessment completion indicators
  const completedAssignments = assignments.filter(a => 
    a.status === 'completed' && 
    a.assessment_results
  )
  
  const hasDetailedAssessments = completedAssignments.some(a => 
    a.assessment_results?.scores && 
    Object.keys(a.assessment_results.scores).length > 2
  )
  
  if (hasDetailedAssessments) {
    realScore += 0.2
    indicators.push('Detailed assessment results detected')
  }
  
  // Data volume indicators
  const totalStudents = assignments.length
  if (totalStudents > 15 && totalStudents < 35) {
    realScore += 0.1
    indicators.push('Realistic class size detected')
  } else if (totalStudents === 24 || totalStudents === 20) {
    demoScore += 0.2
    indicators.push('Standard demo class size detected')
  }
  
  // Email pattern analysis
  const parentEmails = assignments.map(a => a.parent_email || '').filter(Boolean)
  const hasGenericEmails = parentEmails.some(email => 
    email.includes('example.com') ||
    email.includes('demo') ||
    email.includes('test')
  )
  
  if (hasGenericEmails) {
    demoScore += 0.4
    indicators.push('Generic email addresses detected')
  }
  
  const hasRealisticEmails = parentEmails.some(email => {
    const domain = email.split('@')[1]
    return domain && 
           !domain.includes('example') &&
           !domain.includes('demo') &&
           !domain.includes('test') &&
           domain.includes('.')
  })
  
  if (hasRealisticEmails) {
    realScore += 0.3
    indicators.push('Realistic email addresses detected')
  }
  
  // Calculate final classification
  const confidence = Math.abs(realScore - demoScore)
  let type: 'demo' | 'real' | 'mixed' = 'mixed'
  
  if (confidence > 0.3) {
    type = realScore > demoScore ? 'real' : 'demo'
  }
  
  // Special case: if we have both real and demo indicators, it's mixed
  if (realScore > 0.2 && demoScore > 0.2) {
    type = 'mixed'
  }
  
  return {
    type,
    confidence,
    indicators,
    totalRecords: totalStudents,
    realRecords: type === 'real' ? totalStudents : (type === 'mixed' ? Math.floor(totalStudents * 0.6) : 0),
    demoRecords: type === 'demo' ? totalStudents : (type === 'mixed' ? Math.ceil(totalStudents * 0.4) : 0),
    classroomName: classrooms[0]?.name,
    teacherEmail,
    hasRealStudents: realScore > 0.2,
    hasCompletedAssessments: completedAssignments.length > 0
  }
}

/**
 * Get user-friendly data source description
 */
export function getDataSourceDescription(dataSource: ClassroomDataSource): {
  title: string
  description: string
  actionText?: string
  type: 'warning' | 'info' | 'success'
} {
  switch (dataSource.type) {
    case 'real':
      return {
        title: 'Real Student Data',
        description: `Showing data for ${dataSource.totalRecords} real students in your classroom.`,
        type: 'success'
      }
      
    case 'demo':
      return {
        title: 'Demo Data Active',
        description: `You're viewing sample data. Send learning assessments to see your real students here.`,
        actionText: 'Send Assessments',
        type: 'warning'
      }
      
    case 'mixed':
      return {
        title: 'Partial Real Data',
        description: `Showing ${dataSource.realRecords} real students and ${dataSource.demoRecords} demo entries. ${dataSource.hasCompletedAssessments ? 'Some assessments completed.' : 'Send more assessments for complete data.'}`,
        actionText: dataSource.hasCompletedAssessments ? 'Send More Assessments' : 'Complete Assessments',
        type: 'info'
      }
  }
}

/**
 * Check if a specific record appears to be demo data
 */
export function isLikelyDemoRecord(record: any): boolean {
  const name = record.child_name || record.name || ''
  const email = record.parent_email || record.email || ''
  
  const demoNamePatterns = [
    /demo/i,
    /test/i,
    /sample/i,
    /student \d+/i,
    /child \d+/i,
    /(emma thompson|john smith|jane doe)/i
  ]
  
  const demoEmailPatterns = [
    /example\.com/i,
    /demo/i,
    /test/i,
    /parent\d+@/i
  ]
  
  return demoNamePatterns.some(pattern => pattern.test(name)) ||
         demoEmailPatterns.some(pattern => pattern.test(email))
}

/**
 * Separate real and demo records
 */
export function separateRealAndDemoData<T extends any>(records: T[]): {
  realRecords: T[]
  demoRecords: T[]
} {
  const realRecords: T[] = []
  const demoRecords: T[] = []
  
  records.forEach(record => {
    if (isLikelyDemoRecord(record)) {
      demoRecords.push(record)
    } else {
      realRecords.push(record)
    }
  })
  
  return { realRecords, demoRecords }
}
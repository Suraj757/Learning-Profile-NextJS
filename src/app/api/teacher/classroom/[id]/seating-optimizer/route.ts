import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { SeatingArrangement, StudentSeat, SpecialAccommodation, EnhancedStudentProfile } from '@/lib/types-enhanced'

/**
 * GET /api/teacher/classroom/[id]/seating-optimizer
 * 
 * Generate optimal seating arrangements based on:
 * - Student collaboration preferences
 * - Learning style compatibility matrix
 * - Behavioral considerations (focus, energy levels)
 * - Optimal grouping algorithms
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const classroomId = params.id
    const url = new URL(request.url)
    const layoutType = url.searchParams.get('layout') || 'mixed'
    const considerRiskFactors = url.searchParams.get('risk_factors') === 'true'

    // Get all students in the classroom with their profiles and preferences
    const { data: studentData, error: studentError } = await supabase
      .from('enhanced_student_profiles')
      .select(`
        *,
        profiles:profile_id (
          id,
          child_name,
          grade,
          personality_label,
          scores,
          created_at
        ),
        student_risk_factors (
          id,
          risk_type,
          severity,
          description,
          status
        )
      `)
      .eq('classroom_id', classroomId)

    if (studentError || !studentData) {
      return NextResponse.json(
        { error: 'Failed to fetch student data' },
        { status: 500 }
      )
    }

    // Get existing seating arrangements for comparison
    const { data: existingArrangements } = await supabase
      .from('seating_arrangements')
      .select('*')
      .eq('classroom_id', classroomId)
      .eq('is_active', true)
      .order('overall_effectiveness', { ascending: false })

    // Transform student data
    const students: EnhancedStudentProfile[] = studentData.map(student => {
      const profile = student.profiles as any
      return {
        id: student.id,
        name: profile.child_name,
        grade: profile.grade,
        classroom_id: student.classroom_id,
        learning_style: getLearningStyleFromLabel(profile.personality_label),
        six_c_scores: {
          communication: student.communication_score,
          collaboration: student.collaboration_score,
          content: student.content_score,
          critical_thinking: student.critical_thinking_score,
          creative_innovation: student.creative_innovation_score,
          confidence: student.confidence_score
        },
        risk_factors: (student.student_risk_factors || [])
          .filter((rf: any) => rf.status === 'active')
          .map((rf: any) => ({
            id: rf.id,
            type: rf.risk_type,
            severity: rf.severity,
            description: rf.description,
            indicators: [],
            intervention_strategies: [],
            timeline: 'ongoing' as const
          })),
        seating_preferences: student.seating_preferences || getDefaultSeatingPreferences(),
        parent_insights: [],
        progress_timeline: [],
        created_at: student.created_at,
        updated_at: student.updated_at,
        last_assessment_date: student.last_assessment_date,
        teaching_style_compatibility: student.teaching_compatibility || {},
        engagement_level: student.engagement_level,
        participation_frequency: student.participation_frequency,
        peer_interaction_quality: student.peer_interaction_quality
      }
    })

    // Generate multiple seating arrangement options
    const arrangements: SeatingArrangement[] = []

    // Generate arrangements for different layouts
    const layouts = layoutType === 'mixed' 
      ? ['groups', 'rows', 'u_shape', 'circle'] 
      : [layoutType as any]

    for (const layout of layouts) {
      const arrangement = await generateOptimalSeating(
        students,
        layout,
        classroomId,
        considerRiskFactors,
        supabase
      )
      if (arrangement) {
        arrangements.push(arrangement)
      }
    }

    // Sort arrangements by effectiveness
    arrangements.sort((a, b) => b.overall_effectiveness - a.overall_effectiveness)

    return NextResponse.json({
      arrangements: arrangements.slice(0, 3), // Return top 3 arrangements
      existing_arrangements: existingArrangements || [],
      optimization_factors: {
        total_students: students.length,
        learning_style_distribution: calculateLearningStyleDistribution(students),
        collaboration_preferences: calculateCollaborationPreferences(students),
        risk_considerations: considerRiskFactors
      }
    })

  } catch (error) {
    console.error('Error generating seating arrangements:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/teacher/classroom/[id]/seating-optimizer
 * 
 * Save a seating arrangement and track its effectiveness
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { arrangement, teacher_notes } = body

    if (!arrangement) {
      return NextResponse.json(
        { error: 'Missing arrangement data' },
        { status: 400 }
      )
    }

    // Save the seating arrangement
    const { data: savedArrangement, error: saveError } = await supabase
      .from('seating_arrangements')
      .insert({
        classroom_id: params.id,
        arrangement_name: arrangement.arrangement_name,
        layout_type: arrangement.layout_type,
        student_assignments: arrangement.student_assignments,
        collaboration_score: arrangement.collaboration_score,
        focus_score: arrangement.focus_score,
        behavior_management_score: arrangement.behavior_management_score,
        overall_effectiveness: arrangement.overall_effectiveness,
        special_accommodations: arrangement.special_accommodations || [],
        teacher_notes: teacher_notes || arrangement.teacher_notes
      })
      .select()
      .single()

    if (saveError) {
      return NextResponse.json(
        { error: 'Failed to save arrangement' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      arrangement: savedArrangement
    })

  } catch (error) {
    console.error('Error saving seating arrangement:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
async function generateOptimalSeating(
  students: EnhancedStudentProfile[],
  layoutType: string,
  classroomId: string,
  considerRiskFactors: boolean,
  supabase: any
): Promise<SeatingArrangement | null> {
  const studentCount = students.length
  if (studentCount === 0) return null

  // Calculate optimal positions based on layout
  const positions = generatePositions(layoutType, studentCount)
  
  // Create compatibility matrix
  const compatibilityMatrix = createCompatibilityMatrix(students)
  
  // Generate student assignments using optimization algorithm
  const assignments = optimizeStudentAssignments(
    students,
    positions,
    compatibilityMatrix,
    layoutType,
    considerRiskFactors
  )

  // Calculate scores
  const scores = calculateArrangementScores(students, assignments, layoutType)
  
  // Generate special accommodations
  const specialAccommodations = generateSpecialAccommodations(students, assignments)

  const arrangement: SeatingArrangement = {
    id: `${Date.now()}-${layoutType}`,
    classroom_id: classroomId,
    arrangement_name: `Optimized ${layoutType.charAt(0).toUpperCase() + layoutType.slice(1)} Layout`,
    layout_type: layoutType as any,
    student_assignments: assignments,
    collaboration_score: scores.collaboration,
    focus_score: scores.focus,
    behavior_management_score: scores.behaviorManagement,
    overall_effectiveness: scores.overall,
    special_accommodations: specialAccommodations,
    teacher_notes: generateTeacherNotes(students, assignments, scores),
    created_at: new Date().toISOString(),
    last_used: ''
  }

  return arrangement
}

function generatePositions(layoutType: string, studentCount: number): Array<{ row: number; seat: number; zone?: string }> {
  const positions: Array<{ row: number; seat: number; zone?: string }> = []

  switch (layoutType) {
    case 'rows':
      const seatsPerRow = Math.ceil(Math.sqrt(studentCount))
      const rows = Math.ceil(studentCount / seatsPerRow)
      for (let r = 1; r <= rows; r++) {
        for (let s = 1; s <= seatsPerRow && positions.length < studentCount; s++) {
          positions.push({ 
            row: r, 
            seat: s, 
            zone: r <= 2 ? 'front' : r <= rows - 1 ? 'middle' : 'back' 
          })
        }
      }
      break

    case 'groups':
      const groupSize = 4
      const groupCount = Math.ceil(studentCount / groupSize)
      for (let g = 1; g <= groupCount; g++) {
        for (let s = 1; s <= groupSize && positions.length < studentCount; s++) {
          positions.push({ 
            row: g, 
            seat: s, 
            zone: `group_${g}` 
          })
        }
      }
      break

    case 'u_shape':
      const leftSide = Math.floor(studentCount / 3)
      const rightSide = Math.floor(studentCount / 3)
      const front = studentCount - leftSide - rightSide

      // Left side
      for (let i = 1; i <= leftSide; i++) {
        positions.push({ row: i, seat: 1, zone: 'left_side' })
      }
      // Front
      for (let i = 1; i <= front; i++) {
        positions.push({ row: leftSide + 1, seat: i + 1, zone: 'front' })
      }
      // Right side
      for (let i = 1; i <= rightSide; i++) {
        positions.push({ row: leftSide - i + 1, seat: front + 2, zone: 'right_side' })
      }
      break

    case 'circle':
      for (let i = 1; i <= studentCount; i++) {
        positions.push({ 
          row: 1, 
          seat: i, 
          zone: 'circle' 
        })
      }
      break

    default:
      // Default to rows
      return generatePositions('rows', studentCount)
  }

  return positions
}

function createCompatibilityMatrix(students: EnhancedStudentProfile[]): number[][] {
  const matrix: number[][] = []
  
  for (let i = 0; i < students.length; i++) {
    matrix[i] = []
    for (let j = 0; j < students.length; j++) {
      if (i === j) {
        matrix[i][j] = 0 // Same student
      } else {
        matrix[i][j] = calculateCompatibilityScore(students[i], students[j])
      }
    }
  }
  
  return matrix
}

function calculateCompatibilityScore(student1: EnhancedStudentProfile, student2: EnhancedStudentProfile): number {
  let score = 5 // Base compatibility

  // Learning style compatibility
  const styleCompatibility = getLearningStyleCompatibility(student1.learning_style, student2.learning_style)
  score += styleCompatibility

  // 6C scores similarity (similar scores often work well together)
  const scoreDifference = Math.abs(
    (student1.six_c_scores.collaboration + student1.six_c_scores.communication) -
    (student2.six_c_scores.collaboration + student2.six_c_scores.communication)
  ) / 2
  score += Math.max(0, 3 - scoreDifference) // Bonus for similar scores

  // Energy level compatibility
  const energy1 = student1.seating_preferences.energy_level
  const energy2 = student2.seating_preferences.energy_level
  if (energy1 === energy2) score += 1
  else if ((energy1 === 'high' && energy2 === 'low') || (energy1 === 'low' && energy2 === 'high')) score -= 2

  // Risk factor considerations
  const hasHighRisk1 = student1.risk_factors.some(rf => rf.severity === 'high')
  const hasHighRisk2 = student2.risk_factors.some(rf => rf.severity === 'high')
  if (hasHighRisk1 && hasHighRisk2) score -= 3 // Don't put two high-risk students together

  // Social isolation considerations
  const hasIsolationRisk1 = student1.risk_factors.some(rf => rf.type === 'social_isolation')
  const hasIsolationRisk2 = student2.risk_factors.some(rf => rf.type === 'social_isolation')
  if (hasIsolationRisk1 && !hasIsolationRisk2 && student2.six_c_scores.collaboration >= 4) {
    score += 2 // Pair isolated student with collaborative student
  }

  return Math.max(0, Math.min(10, score))
}

function getLearningStyleCompatibility(style1: string, style2: string): number {
  const compatibilityMap: Record<string, Record<string, number>> = {
    creative: { creative: 1, analytical: -1, collaborative: 2, confident: 1 },
    analytical: { creative: -1, analytical: 1, collaborative: 0, confident: 0 },
    collaborative: { creative: 2, analytical: 0, collaborative: 2, confident: 1 },
    confident: { creative: 1, analytical: 0, collaborative: 1, confident: 0 }
  }

  return compatibilityMap[style1]?.[style2] || 0
}

function optimizeStudentAssignments(
  students: EnhancedStudentProfile[],
  positions: Array<{ row: number; seat: number; zone?: string }>,
  compatibilityMatrix: number[][],
  layoutType: string,
  considerRiskFactors: boolean
): StudentSeat[] {
  // This is a simplified optimization algorithm
  // In a real implementation, you might use more sophisticated algorithms like Hungarian algorithm or genetic algorithms
  
  const assignments: StudentSeat[] = []
  const usedPositions = new Set<number>()
  const assignedStudents = new Set<number>()

  // First, handle special placement needs
  students.forEach((student, studentIndex) => {
    if (assignedStudents.has(studentIndex)) return

    const specialNeeds = getSpecialPlacementNeeds(student)
    if (specialNeeds.length > 0) {
      const idealPosition = findIdealPosition(student, positions, specialNeeds, usedPositions)
      if (idealPosition !== -1) {
        assignments.push({
          student_id: student.id,
          position: positions[idealPosition],
          rationale: specialNeeds,
          compatibility_factors: [`Special placement: ${specialNeeds.join(', ')}`]
        })
        usedPositions.add(idealPosition)
        assignedStudents.add(studentIndex)
      }
    }
  })

  // Then, optimize remaining assignments using a greedy approach
  const remainingStudents = students.filter((_, index) => !assignedStudents.has(index))
  
  for (const student of remainingStudents) {
    const studentIndex = students.findIndex(s => s.id === student.id)
    let bestPosition = -1
    let bestScore = -1

    for (let posIndex = 0; posIndex < positions.length; posIndex++) {
      if (usedPositions.has(posIndex)) continue

      const score = calculatePositionScore(
        student,
        positions[posIndex],
        assignments,
        students,
        compatibilityMatrix[studentIndex],
        layoutType
      )

      if (score > bestScore) {
        bestScore = score
        bestPosition = posIndex
      }
    }

    if (bestPosition !== -1) {
      const rationale = generatePlacementRationale(student, positions[bestPosition], assignments, students)
      const compatibilityFactors = generateCompatibilityFactors(student, assignments, students, compatibilityMatrix[studentIndex])

      assignments.push({
        student_id: student.id,
        position: positions[bestPosition],
        rationale,
        compatibility_factors: compatibilityFactors
      })
      usedPositions.add(bestPosition)
    }
  }

  return assignments
}

function getSpecialPlacementNeeds(student: EnhancedStudentProfile): string[] {
  const needs: string[] = []

  // Check risk factors
  student.risk_factors.forEach(rf => {
    switch (rf.type) {
      case 'social_isolation':
        needs.push('Needs supportive peer placement')
        break
      case 'low_engagement':
        needs.push('Benefits from front placement')
        break
      case 'academic_struggle':
        needs.push('Requires teacher proximity')
        break
    }
  })

  // Check seating preferences
  if (student.seating_preferences.proximity_needs === 'close_to_teacher') {
    needs.push('Close to teacher placement')
  }

  if (student.seating_preferences.focus_requirements === 'quiet') {
    needs.push('Quiet area placement')
  }

  return needs
}

function findIdealPosition(
  student: EnhancedStudentProfile,
  positions: Array<{ row: number; seat: number; zone?: string }>,
  specialNeeds: string[],
  usedPositions: Set<number>
): number {
  for (let i = 0; i < positions.length; i++) {
    if (usedPositions.has(i)) continue

    const position = positions[i]
    let meetsNeeds = true

    specialNeeds.forEach(need => {
      switch (need) {
        case 'Close to teacher placement':
        case 'Benefits from front placement':
        case 'Requires teacher proximity':
          if (position.zone !== 'front' && position.row > 2) {
            meetsNeeds = false
          }
          break
        case 'Quiet area placement':
          if (position.zone === 'back' && position.seat <= 2) {
            // Prefer corners for quiet placement
          } else {
            meetsNeeds = false
          }
          break
      }
    })

    if (meetsNeeds) return i
  }

  return -1 // No ideal position found
}

function calculatePositionScore(
  student: EnhancedStudentProfile,
  position: { row: number; seat: number; zone?: string },
  currentAssignments: StudentSeat[],
  allStudents: EnhancedStudentProfile[],
  compatibilityScores: number[],
  layoutType: string
): number {
  let score = 0

  // Base position preferences
  if (student.seating_preferences.proximity_needs === 'close_to_teacher' && position.zone === 'front') {
    score += 3
  }

  if (student.seating_preferences.focus_requirements === 'quiet' && (position.zone === 'front' || position.seat <= 2)) {
    score += 2
  }

  // Calculate compatibility with nearby students
  const nearbyAssignments = currentAssignments.filter(assignment => 
    isAdjacent(position, assignment.position, layoutType)
  )

  nearbyAssignments.forEach(assignment => {
    const nearbyStudent = allStudents.find(s => s.id === assignment.student_id)
    if (nearbyStudent) {
      const nearbyIndex = allStudents.findIndex(s => s.id === nearbyStudent.id)
      score += compatibilityScores[nearbyIndex] || 0
    }
  })

  return score
}

function isAdjacent(
  pos1: { row: number; seat: number; zone?: string },
  pos2: { row: number; seat: number; zone?: string },
  layoutType: string
): boolean {
  switch (layoutType) {
    case 'groups':
      return pos1.zone === pos2.zone
    case 'rows':
      return Math.abs(pos1.row - pos2.row) <= 1 && Math.abs(pos1.seat - pos2.seat) <= 1
    case 'circle':
      return Math.abs(pos1.seat - pos2.seat) <= 1 || (pos1.seat === 1 && pos2.seat === Math.max(pos1.seat, pos2.seat))
    case 'u_shape':
      return (pos1.zone === pos2.zone && Math.abs(pos1.row - pos2.row) <= 1) ||
             (pos1.zone !== pos2.zone && pos1.row === pos2.row)
    default:
      return false
  }
}

function calculateArrangementScores(
  students: EnhancedStudentProfile[],
  assignments: StudentSeat[],
  layoutType: string
): { collaboration: number; focus: number; behaviorManagement: number; overall: number } {
  let collaborationScore = 0
  let focusScore = 0
  let behaviorManagementScore = 0

  // Calculate collaboration score based on groupings and compatibility
  if (layoutType === 'groups') {
    collaborationScore = 85 // Groups naturally support collaboration
  } else if (layoutType === 'circle') {
    collaborationScore = 75 // Circle supports discussion
  } else {
    collaborationScore = 60 // Rows and U-shape are moderate for collaboration
  }

  // Calculate focus score based on layout and student needs
  const studentsNeedingFocus = students.filter(s => 
    s.seating_preferences.focus_requirements === 'quiet' ||
    s.risk_factors.some(rf => rf.type === 'low_engagement')
  ).length

  const frontPlacements = assignments.filter(a => 
    a.position.zone === 'front' || a.position.row <= 2
  ).length

  focusScore = Math.min(100, (frontPlacements / Math.max(studentsNeedingFocus, 1)) * 100)

  // Calculate behavior management score
  const highRiskStudents = students.filter(s => 
    s.risk_factors.some(rf => rf.severity === 'high')
  )

  const highRiskSeparated = highRiskStudents.length <= 1 || 
    !highRiskStudents.some((student1, i) => 
      highRiskStudents.some((student2, j) => 
        i !== j && areStudentsAdjacent(student1.id, student2.id, assignments, layoutType)
      )
    )

  behaviorManagementScore = highRiskSeparated ? 90 : 60

  // Special accommodations boost
  const specialAccommodations = assignments.filter(a => a.rationale.length > 0).length
  const accommodationBonus = Math.min(20, (specialAccommodations / students.length) * 40)

  const overall = Math.round(
    (collaborationScore * 0.3 + focusScore * 0.3 + behaviorManagementScore * 0.3 + accommodationBonus * 0.1)
  )

  return {
    collaboration: Math.round(collaborationScore),
    focus: Math.round(focusScore),
    behaviorManagement: Math.round(behaviorManagementScore),
    overall: Math.min(100, overall)
  }
}

function areStudentsAdjacent(
  studentId1: string,
  studentId2: string,
  assignments: StudentSeat[],
  layoutType: string
): boolean {
  const assignment1 = assignments.find(a => a.student_id === studentId1)
  const assignment2 = assignments.find(a => a.student_id === studentId2)

  if (!assignment1 || !assignment2) return false

  return isAdjacent(assignment1.position, assignment2.position, layoutType)
}

function generateSpecialAccommodations(
  students: EnhancedStudentProfile[],
  assignments: StudentSeat[]
): SpecialAccommodation[] {
  const accommodations: SpecialAccommodation[] = []

  students.forEach(student => {
    const assignment = assignments.find(a => a.student_id === student.id)
    if (!assignment) return

    const studentAccommodations: string[] = []

    // Check for specific needs
    if (student.risk_factors.some(rf => rf.type === 'social_isolation')) {
      studentAccommodations.push('Paired with supportive peer')
      studentAccommodations.push('Encouraged participation in group activities')
    }

    if (student.risk_factors.some(rf => rf.type === 'low_engagement')) {
      studentAccommodations.push('Visual proximity to teacher')
      studentAccommodations.push('Easy access for check-ins')
    }

    if (student.seating_preferences.focus_requirements === 'quiet') {
      studentAccommodations.push('Minimized distractions')
      studentAccommodations.push('Quiet work space')
    }

    if (studentAccommodations.length > 0) {
      accommodations.push({
        student_id: student.id,
        accommodation_type: 'seating_support',
        description: `Specialized seating for ${student.name}`,
        positioning_requirements: studentAccommodations
      })
    }
  })

  return accommodations
}

function generatePlacementRationale(
  student: EnhancedStudentProfile,
  position: { row: number; seat: number; zone?: string },
  assignments: StudentSeat[],
  allStudents: EnhancedStudentProfile[]
): string[] {
  const rationale: string[] = []

  // Learning style rationale
  switch (student.learning_style) {
    case 'collaborative':
      if (position.zone?.includes('group')) {
        rationale.push('Placed in group setting to support collaborative learning style')
      }
      break
    case 'creative':
      rationale.push('Positioned for flexibility and movement opportunities')
      break
    case 'analytical':
      if (position.zone === 'front' || position.row <= 2) {
        rationale.push('Front placement for focused attention and minimal distractions')
      }
      break
    case 'confident':
      rationale.push('Strategic placement to utilize leadership skills')
      break
  }

  // Risk factor rationale
  student.risk_factors.forEach(rf => {
    switch (rf.type) {
      case 'low_engagement':
        if (position.zone === 'front') {
          rationale.push('Front placement to increase engagement and teacher interaction')
        }
        break
      case 'social_isolation':
        rationale.push('Placed near supportive peers to encourage social interaction')
        break
    }
  })

  // Seating preference rationale
  if (student.seating_preferences.proximity_needs === 'close_to_teacher' && position.zone === 'front') {
    rationale.push('Close to teacher as per learning preferences')
  }

  return rationale.length > 0 ? rationale : ['Optimal placement based on overall classroom dynamics']
}

function generateCompatibilityFactors(
  student: EnhancedStudentProfile,
  assignments: StudentSeat[],
  allStudents: EnhancedStudentProfile[],
  compatibilityScores: number[]
): string[] {
  const factors: string[] = []

  // Find nearby students and their compatibility
  const nearbyStudents = assignments
    .map(assignment => {
      const nearbyStudent = allStudents.find(s => s.id === assignment.student_id)
      const nearbyIndex = allStudents.findIndex(s => s.id === assignment.student_id)
      return {
        student: nearbyStudent,
        compatibility: compatibilityScores[nearbyIndex] || 0
      }
    })
    .filter(nearby => nearby.student && nearby.compatibility > 6)

  nearbyStudents.forEach(nearby => {
    if (nearby.student) {
      factors.push(`High compatibility with ${nearby.student.name} (${nearby.student.learning_style} learner)`)
    }
  })

  // Learning style factors
  factors.push(`Optimized for ${student.learning_style} learning style`)

  // Engagement factors
  if (student.engagement_level <= 3) {
    factors.push('Positioned to increase engagement and participation')
  }

  return factors.length > 0 ? factors : ['General classroom optimization']
}

function generateTeacherNotes(
  students: EnhancedStudentProfile[],
  assignments: StudentSeat[],
  scores: { collaboration: number; focus: number; behaviorManagement: number; overall: number }
): string {
  const notes: string[] = []

  notes.push(`Overall effectiveness: ${scores.overall}%`)
  notes.push(`Collaboration score: ${scores.collaboration}%`)
  notes.push(`Focus score: ${scores.focus}%`)
  notes.push(`Behavior management score: ${scores.behaviorManagement}%`)

  const specialPlacements = assignments.filter(a => a.rationale.length > 1).length
  if (specialPlacements > 0) {
    notes.push(`${specialPlacements} students have specialized placement considerations`)
  }

  const highRiskStudents = students.filter(s => s.risk_factors.some(rf => rf.severity === 'high')).length
  if (highRiskStudents > 0) {
    notes.push(`${highRiskStudents} high-risk students strategically placed`)
  }

  return notes.join('. ')
}

function getLearningStyleFromLabel(label: string): any {
  if (label.toLowerCase().includes('creative')) return 'creative'
  if (label.toLowerCase().includes('analytical')) return 'analytical'
  if (label.toLowerCase().includes('collaborative')) return 'collaborative'
  if (label.toLowerCase().includes('confident')) return 'confident'
  return 'creative'
}

function getDefaultSeatingPreferences() {
  return {
    preferred_group_size: 4,
    collaboration_comfort: 'medium' as const,
    focus_requirements: 'moderate' as const,
    energy_level: 'medium' as const,
    peer_interactions: 'collaborator' as const,
    proximity_needs: 'flexible' as const
  }
}

function calculateLearningStyleDistribution(students: EnhancedStudentProfile[]) {
  return students.reduce((acc, student) => {
    acc[student.learning_style] = (acc[student.learning_style] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

function calculateCollaborationPreferences(students: EnhancedStudentProfile[]) {
  return {
    high_collaboration: students.filter(s => s.seating_preferences.collaboration_comfort === 'high').length,
    medium_collaboration: students.filter(s => s.seating_preferences.collaboration_comfort === 'medium').length,
    low_collaboration: students.filter(s => s.seating_preferences.collaboration_comfort === 'low').length
  }
}
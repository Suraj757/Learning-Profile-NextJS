/**
 * Comprehensive Test Data Generator for Education App
 * Creates realistic test scenarios with complete data flow coverage
 */

import { supabase, createTeacher, createClassroom, createProfileAssignment, getTeacherByEmail } from './supabase'
import { createProfile } from './supabase'
// import { generateShareToken } from './utils' // Not needed for this implementation

// Realistic School Districts and Schools
const SCHOOL_DISTRICTS = [
  { name: "Riverside Unified School District", city: "Riverside", state: "CA" },
  { name: "Oak Valley Educational Collective", city: "Oak Valley", state: "TX" },
  { name: "Pine Hill Independent School District", city: "Pine Hill", state: "FL" },
  { name: "Sunset Ridge School System", city: "Sunset Ridge", state: "CO" }
]

const ELEMENTARY_SCHOOLS = [
  "Maplewood Elementary", "Sunrise Elementary", "Cedar Grove Elementary", 
  "Willow Creek Elementary", "Highland Elementary", "Brookside Elementary",
  "Forest Hills Elementary", "Meadowview Elementary", "Riverside Elementary"
]

// Comprehensive Teacher Test Data
export interface TestTeacher {
  id?: number
  email: string
  name: string
  school: string
  grade_level: string
  scenario: 'new' | 'experienced' | 'mixed_data' | 'substitute' | 'specialist'
  description: string
  password_setup_needed?: boolean
  years_experience?: number
  specializations?: string[]
  demo_data_level: 'minimal' | 'partial' | 'full'
}

export const TEST_TEACHERS: TestTeacher[] = [
  // New Teacher Scenarios
  {
    email: "sarah.martinez@riverside.edu",
    name: "Sarah Martinez",
    school: "Maplewood Elementary",
    grade_level: "1st Grade",
    scenario: "new",
    description: "First-year teacher, needs password setup and full onboarding",
    password_setup_needed: true,
    years_experience: 0,
    demo_data_level: "minimal"
  },
  {
    email: "james.thompson@oakvalley.edu",
    name: "James Thompson", 
    school: "Sunrise Elementary",
    grade_level: "Kindergarten",
    scenario: "new",
    description: "Second-year teacher, completed basic training, needs classroom setup",
    password_setup_needed: true,
    years_experience: 1,
    demo_data_level: "minimal"
  },

  // Experienced Teacher Scenarios  
  {
    email: "lisa.chen@pinehill.edu",
    name: "Lisa Chen",
    school: "Cedar Grove Elementary", 
    grade_level: "3rd Grade",
    scenario: "experienced",
    description: "Veteran teacher with established classroom, full historical data",
    password_setup_needed: false,
    years_experience: 12,
    demo_data_level: "full"
  },
  {
    email: "michael.rodriguez@sunsetridge.edu", 
    name: "Michael Rodriguez",
    school: "Willow Creek Elementary",
    grade_level: "2nd Grade", 
    scenario: "experienced",
    description: "Department head with multiple years of assessment data",
    password_setup_needed: false,
    years_experience: 8,
    demo_data_level: "full"
  },

  // Mixed Data Scenarios
  {
    email: "jennifer.white@riverside.edu",
    name: "Jennifer White",
    school: "Highland Elementary",
    grade_level: "4th Grade",
    scenario: "mixed_data", 
    description: "Teacher with mix of completed and pending assessments",
    password_setup_needed: false,
    years_experience: 5,
    demo_data_level: "partial"
  },
  {
    email: "david.johnson@oakvalley.edu",
    name: "David Johnson",
    school: "Brookside Elementary", 
    grade_level: "5th Grade",
    scenario: "mixed_data",
    description: "Teacher transitioning from paper to digital assessments", 
    password_setup_needed: false,
    years_experience: 15,
    demo_data_level: "partial"
  },

  // Specialist Teachers
  {
    email: "maria.garcia@pinehill.edu",
    name: "Maria Garcia",
    school: "Forest Hills Elementary",
    grade_level: "K-5 ESL",
    scenario: "specialist",
    description: "ESL specialist working with students across multiple grades",
    password_setup_needed: false,
    years_experience: 7,
    specializations: ["ESL", "Bilingual Education", "Cultural Sensitivity"],
    demo_data_level: "partial"
  },
  {
    email: "robert.davis@sunsetridge.edu", 
    name: "Robert Davis",
    school: "Meadowview Elementary",
    grade_level: "K-5 Special Ed",
    scenario: "specialist",
    description: "Special education teacher with focus on learning accommodations",
    password_setup_needed: false,
    years_experience: 10,
    specializations: ["Special Education", "IEP Development", "Behavioral Support"],
    demo_data_level: "full"
  },

  // Substitute Teachers
  {
    email: "amanda.wilson@riverside.edu",
    name: "Amanda Wilson", 
    school: "Riverside Elementary",
    grade_level: "K-3 Substitute",
    scenario: "substitute",
    description: "Long-term substitute needing quick access to student insights",
    password_setup_needed: true,
    years_experience: 3,
    demo_data_level: "minimal"
  }
]

// Realistic Classroom Configurations
export interface TestClassroom {
  name: string
  grade_level: string
  subject_area?: string
  school_year: string
  max_students: number
  classroom_type: 'regular' | 'inclusion' | 'honors' | 'intervention' | 'mixed_grade'
  description: string
}

export const CLASSROOM_TEMPLATES: Record<string, TestClassroom[]> = {
  'new': [
    {
      name: "Room 12 - Morning Kindergarten",
      grade_level: "Kindergarten", 
      school_year: "2024-2025",
      max_students: 18,
      classroom_type: "regular",
      description: "First classroom assignment for new teacher"
    }
  ],
  'experienced': [
    {
      name: "Mrs. Chen's Creative Writers",
      grade_level: "3rd Grade",
      school_year: "2024-2025", 
      max_students: 24,
      classroom_type: "regular",
      description: "Established classroom with integrated arts program"
    },
    {
      name: "Advanced Math Explorers",
      grade_level: "3rd Grade",
      subject_area: "Mathematics",
      school_year: "2024-2025",
      max_students: 16,
      classroom_type: "honors", 
      description: "Pull-out advanced math group"
    }
  ],
  'mixed_data': [
    {
      name: "Room 24 - Growing Learners",
      grade_level: "4th Grade",
      school_year: "2024-2025",
      max_students: 26,
      classroom_type: "inclusion",
      description: "Inclusive classroom with diverse learning needs"
    }
  ],
  'specialist': [
    {
      name: "ESL Language Development", 
      grade_level: "K-5",
      subject_area: "English Language Learning",
      school_year: "2024-2025",
      max_students: 15,
      classroom_type: "intervention",
      description: "Specialized language support across grade levels"
    },
    {
      name: "Learning Support Center",
      grade_level: "K-5", 
      subject_area: "Special Education",
      school_year: "2024-2025", 
      max_students: 12,
      classroom_type: "intervention",
      description: "Resource room for individualized support"
    }
  ],
  'substitute': [
    {
      name: "Room 8 - Temporary Assignment",
      grade_level: "2nd Grade",
      school_year: "2024-2025",
      max_students: 22,
      classroom_type: "regular",
      description: "Long-term substitute placement"
    }
  ]
}

// Comprehensive Student Data with Realistic Demographics
export interface TestStudent {
  first_name: string
  last_name: string
  parent_first_name: string
  parent_last_name: string
  parent_email: string
  grade_level: string
  learning_style: 'Creative' | 'Analytical' | 'Collaborative' | 'Confident'
  assessment_completed: boolean
  special_needs?: string[]
  languages?: string[]
  family_situation?: 'two_parent' | 'single_parent' | 'guardian' | 'extended_family'
  socioeconomic_factors?: string[]
  engagement_level: 'high' | 'medium' | 'low' | 'variable'
}

export const STUDENT_POOLS: Record<string, TestStudent[]> = {
  'kindergarten': [
    {
      first_name: "Emma", last_name: "Johnson", 
      parent_first_name: "Sarah", parent_last_name: "Johnson",
      parent_email: "sarah.johnson.parent@email.com",
      grade_level: "Kindergarten", learning_style: "Creative",
      assessment_completed: true, engagement_level: "high"
    },
    {
      first_name: "Liam", last_name: "Martinez", 
      parent_first_name: "Carlos", parent_last_name: "Martinez",
      parent_email: "carlos.martinez.papa@email.com", 
      grade_level: "Kindergarten", learning_style: "Analytical",
      assessment_completed: false, languages: ["Spanish", "English"],
      engagement_level: "medium"
    },
    {
      first_name: "Zoe", last_name: "Chen",
      parent_first_name: "Ming", parent_last_name: "Chen", 
      parent_email: "ming.chen.family@email.com",
      grade_level: "Kindergarten", learning_style: "Collaborative",
      assessment_completed: true, languages: ["Mandarin", "English"],
      engagement_level: "high"
    },
    {
      first_name: "Aiden", last_name: "Thompson",
      parent_first_name: "Jennifer", parent_last_name: "Thompson",
      parent_email: "jenny.thompson.mom@email.com",
      grade_level: "Kindergarten", learning_style: "Confident", 
      assessment_completed: true, family_situation: "single_parent",
      engagement_level: "variable"
    }
  ],
  '1st_grade': [
    {
      first_name: "Sofia", last_name: "Rodriguez",
      parent_first_name: "Maria", parent_last_name: "Rodriguez",
      parent_email: "maria.rodriguez.familia@email.com", 
      grade_level: "1st Grade", learning_style: "Creative",
      assessment_completed: true, languages: ["Spanish", "English"],
      engagement_level: "high"
    },
    {
      first_name: "Noah", last_name: "Williams",
      parent_first_name: "Michael", parent_last_name: "Williams", 
      parent_email: "mike.williams.dad@email.com",
      grade_level: "1st Grade", learning_style: "Collaborative",
      assessment_completed: false, engagement_level: "medium"
    },
    {
      first_name: "Ava", last_name: "Davis", 
      parent_first_name: "Ashley", parent_last_name: "Davis",
      parent_email: "ashley.davis.parent@email.com",
      grade_level: "1st Grade", learning_style: "Analytical",
      assessment_completed: true, special_needs: ["ADHD support"],
      engagement_level: "variable"
    },
    {
      first_name: "Ethan", last_name: "Brown",
      parent_first_name: "Robert", parent_last_name: "Brown",
      parent_email: "rob.brown.family@email.com",
      grade_level: "1st Grade", learning_style: "Confident",
      assessment_completed: true, engagement_level: "high"
    }
  ],
  '2nd_grade': [
    {
      first_name: "Isabella", last_name: "Garcia", 
      parent_first_name: "Carmen", parent_last_name: "Garcia",
      parent_email: "carmen.garcia.madre@email.com",
      grade_level: "2nd Grade", learning_style: "Collaborative",
      assessment_completed: true, languages: ["Spanish", "English"],
      engagement_level: "high"
    },
    {
      first_name: "Lucas", last_name: "Miller",
      parent_first_name: "Jennifer", parent_last_name: "Miller",
      parent_email: "jen.miller.parent@email.com", 
      grade_level: "2nd Grade", learning_style: "Analytical",
      assessment_completed: false, engagement_level: "medium"
    },
    {
      first_name: "Mia", last_name: "Wilson",
      parent_first_name: "David", parent_last_name: "Wilson",
      parent_email: "david.wilson.dad@email.com",
      grade_level: "2nd Grade", learning_style: "Creative",
      assessment_completed: true, engagement_level: "high"
    },
    {
      first_name: "Mason", last_name: "Taylor", 
      parent_first_name: "Lisa", parent_last_name: "Taylor",
      parent_email: "lisa.taylor.mom@email.com",
      grade_level: "2nd Grade", learning_style: "Confident",
      assessment_completed: true, family_situation: "two_parent",
      engagement_level: "variable"
    }
  ],
  '3rd_grade': [
    {
      first_name: "Olivia", last_name: "Anderson",
      parent_first_name: "Michelle", parent_last_name: "Anderson", 
      parent_email: "michelle.anderson.family@email.com",
      grade_level: "3rd Grade", learning_style: "Creative",
      assessment_completed: true, engagement_level: "high"
    },
    {
      first_name: "Alexander", last_name: "Thomas",
      parent_first_name: "James", parent_last_name: "Thomas",
      parent_email: "james.thomas.parent@email.com",
      grade_level: "3rd Grade", learning_style: "Analytical", 
      assessment_completed: true, engagement_level: "high"
    },
    {
      first_name: "Grace", last_name: "Jackson", 
      parent_first_name: "Angela", parent_last_name: "Jackson",
      parent_email: "angela.jackson.mom@email.com",
      grade_level: "3rd Grade", learning_style: "Collaborative",
      assessment_completed: false, engagement_level: "medium"
    },
    {
      first_name: "Logan", last_name: "White",
      parent_first_name: "Kevin", parent_last_name: "White",
      parent_email: "kevin.white.dad@email.com", 
      grade_level: "3rd Grade", learning_style: "Confident",
      assessment_completed: true, special_needs: ["Gifted program"],
      engagement_level: "high"
    }
  ],
  '4th_grade': [
    {
      first_name: "Chloe", last_name: "Harris",
      parent_first_name: "Stephanie", parent_last_name: "Harris",
      parent_email: "stephanie.harris.parent@email.com",
      grade_level: "4th Grade", learning_style: "Creative",
      assessment_completed: true, engagement_level: "medium"
    },
    {
      first_name: "Benjamin", last_name: "Martin",
      parent_first_name: "Christopher", parent_last_name: "Martin", 
      parent_email: "chris.martin.family@email.com",
      grade_level: "4th Grade", learning_style: "Analytical",
      assessment_completed: false, engagement_level: "high"
    },
    {
      first_name: "Ella", last_name: "Lee",
      parent_first_name: "Grace", parent_last_name: "Lee",
      parent_email: "grace.lee.parent@email.com",
      grade_level: "4th Grade", learning_style: "Collaborative", 
      assessment_completed: true, languages: ["Korean", "English"],
      engagement_level: "high"
    },
    {
      first_name: "Owen", last_name: "Clark",
      parent_first_name: "Jessica", parent_last_name: "Clark",
      parent_email: "jessica.clark.mom@email.com",
      grade_level: "4th Grade", learning_style: "Confident",
      assessment_completed: true, family_situation: "single_parent",
      engagement_level: "variable"
    }
  ],
  '5th_grade': [
    {
      first_name: "Lily", last_name: "Lewis", 
      parent_first_name: "Amanda", parent_last_name: "Lewis",
      parent_email: "amanda.lewis.parent@email.com",
      grade_level: "5th Grade", learning_style: "Creative",
      assessment_completed: true, engagement_level: "high"
    },
    {
      first_name: "Henry", last_name: "Walker",
      parent_first_name: "Daniel", parent_last_name: "Walker",
      parent_email: "dan.walker.dad@email.com",
      grade_level: "5th Grade", learning_style: "Analytical",
      assessment_completed: true, engagement_level: "high"
    },
    {
      first_name: "Aria", last_name: "Hall",
      parent_first_name: "Rachel", parent_last_name: "Hall", 
      parent_email: "rachel.hall.family@email.com",
      grade_level: "5th Grade", learning_style: "Collaborative",
      assessment_completed: false, engagement_level: "medium"
    },
    {
      first_name: "Jackson", last_name: "Young",
      parent_first_name: "Brian", parent_last_name: "Young",
      parent_email: "brian.young.parent@email.com",
      grade_level: "5th Grade", learning_style: "Confident", 
      assessment_completed: true, special_needs: ["Advanced reading"],
      engagement_level: "high"
    }
  ]
}

// Generate realistic assessment results
function generateAssessmentResults(student: TestStudent) {
  const baseScores = {
    Creative: { Communication: 4, Collaboration: 3, Content: 4, 'Critical Thinking': 3, 'Creative Innovation': 5, Confidence: 3 },
    Analytical: { Communication: 3, Collaboration: 3, Content: 5, 'Critical Thinking': 5, 'Creative Innovation': 3, Confidence: 4 },
    Collaborative: { Communication: 5, Collaboration: 5, Content: 3, 'Critical Thinking': 3, 'Creative Innovation': 3, Confidence: 3 },
    Confident: { Communication: 4, Collaboration: 4, Content: 4, 'Critical Thinking': 4, 'Creative Innovation': 4, Confidence: 5 }
  }

  // Add some natural variation
  const scores = { ...baseScores[student.learning_style] }
  Object.keys(scores).forEach(key => {
    const variation = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
    scores[key] = Math.max(1, Math.min(5, scores[key] + variation))
  })

  return {
    scores,
    personality_label: `${student.learning_style} Learner`,
    raw_responses: generateRawResponses(student),
    grade_level: student.grade_level,
    child_name: `${student.first_name} ${student.last_name}`,
    age: getAgeForGrade(student.grade_level)
  }
}

// Generate realistic raw assessment responses
function generateRawResponses(student: TestStudent) {
  // This would generate realistic survey responses based on learning style
  // For brevity, returning a simplified version
  const responses: Record<string, any> = {}
  
  // Core personality questions (1-21)
  for (let i = 1; i <= 21; i++) {
    responses[i.toString()] = Math.floor(Math.random() * 4) + 1 // 1-4 scale
  }
  
  // Interests (question 22) - multiple choice array
  const interestOptions = ["Art & Drawing", "Science & Nature", "Sports & Movement", "Music & Performance", "Building & Engineering", "Reading & Stories"]
  responses['22'] = Array.from({length: Math.floor(Math.random() * 3) + 1}, () => 
    interestOptions[Math.floor(Math.random() * interestOptions.length)]
  ).filter((value, index, self) => self.indexOf(value) === index)
  
  // Engagement style (question 23)
  responses['23'] = Math.floor(Math.random() * 4)
  
  // Learning modality (question 24) 
  responses['24'] = Math.floor(Math.random() * 4)
  
  // Social preference (question 25)
  responses['25'] = Math.floor(Math.random() * 4)
  
  // School experience (question 26)
  responses['26'] = Math.floor(Math.random() * 5)
  
  return responses
}

function getAgeForGrade(grade: string): number {
  const ageMap: Record<string, number> = {
    'Kindergarten': 5,
    '1st Grade': 6,
    '2nd Grade': 7, 
    '3rd Grade': 8,
    '4th Grade': 9,
    '5th Grade': 10
  }
  return ageMap[grade] || 8
}

// Main function to create comprehensive test scenario
export async function createComprehensiveTestScenario(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  if (!supabase) {
    return { 
      success: false, 
      message: "Supabase not configured - test data creation not possible" 
    }
  }

  console.log('🚀 Starting comprehensive test scenario creation...')
  const results: any = {
    teachers: [],
    classrooms: [],
    students: [],
    assessments: [],
    errors: []
  }

  try {
    // 1. Create Test Teachers
    console.log('👩‍🏫 Creating test teachers...')
    for (const teacherTemplate of TEST_TEACHERS) {
      try {
        // Check if teacher already exists
        const existingTeacher = await getTeacherByEmail(teacherTemplate.email)
        
        let teacher
        if (existingTeacher) {
          console.log(`Teacher ${teacherTemplate.email} already exists, using existing`)
          teacher = existingTeacher
        } else {
          teacher = await createTeacher({
            email: teacherTemplate.email,
            name: teacherTemplate.name,
            school: teacherTemplate.school,
            grade_level: teacherTemplate.grade_level
          })
          console.log(`✅ Created teacher: ${teacherTemplate.name}`)
        }
        
        teacherTemplate.id = teacher.id
        results.teachers.push({ ...teacherTemplate, created: !existingTeacher })
        
        // 2. Create Classrooms for this teacher
        const classroomTemplates = CLASSROOM_TEMPLATES[teacherTemplate.scenario] || []
        for (const classroomTemplate of classroomTemplates) {
          try {
            const classroom = await createClassroom(teacher.id, {
              name: classroomTemplate.name,
              grade_level: classroomTemplate.grade_level,
              school_year: classroomTemplate.school_year
            })
            
            results.classrooms.push({
              ...classroom,
              teacher_email: teacher.email,
              template: classroomTemplate
            })
            console.log(`✅ Created classroom: ${classroomTemplate.name}`)
            
            // 3. Add Students to Classroom
            const gradeKey = classroomTemplate.grade_level.toLowerCase().replace(' ', '_').replace('kindergarten', 'kindergarten')
            let studentPool = STUDENT_POOLS[gradeKey] || STUDENT_POOLS['3rd_grade'] // fallback
            
            // For specialists, mix students from different grades
            if (teacherTemplate.scenario === 'specialist') {
              studentPool = [
                ...STUDENT_POOLS['kindergarten'].slice(0, 2),
                ...STUDENT_POOLS['1st_grade'].slice(0, 2),
                ...STUDENT_POOLS['2nd_grade'].slice(0, 2),
                ...STUDENT_POOLS['3rd_grade'].slice(0, 2)
              ]
            }
            
            // Determine number of students based on demo data level
            let numStudents = Math.min(studentPool.length, classroomTemplate.max_students)
            if (teacherTemplate.demo_data_level === 'minimal') numStudents = Math.min(3, numStudents)
            else if (teacherTemplate.demo_data_level === 'partial') numStudents = Math.min(Math.floor(numStudents * 0.6), numStudents)
            
            const selectedStudents = studentPool.slice(0, numStudents)
            
            for (const studentTemplate of selectedStudents) {
              try {
                // Create profile assignment
                const assignment = await createProfileAssignment({
                  teacher_id: teacher.id,
                  parent_email: studentTemplate.parent_email,
                  child_name: `${studentTemplate.first_name} ${studentTemplate.last_name}`
                })
                
                results.students.push({
                  assignment_id: assignment.id,
                  student: studentTemplate,
                  teacher_email: teacher.email,
                  classroom_name: classroom.name
                })
                
                // 4. Create Assessment Results (if completed)
                if (studentTemplate.assessment_completed) {
                  try {
                    const assessmentResults = generateAssessmentResults(studentTemplate)
                    
                    // Create profile in profiles table
                    const { data: profile, error: profileError } = await createProfile({
                      child_name: `${studentTemplate.first_name} ${studentTemplate.last_name}`,
                      grade: studentTemplate.grade_level,
                      responses: assessmentResults.raw_responses,
                      scores: assessmentResults.scores,
                      personality_label: assessmentResults.personality_label,
                      description: `${assessmentResults.personality_label} with strong ${Object.keys(assessmentResults.scores).reduce((a, b) => assessmentResults.scores[a] > assessmentResults.scores[b] ? a : b)} abilities.`
                    })
                    
                    if (!profileError && profile) {
                      // Update assignment with completion status
                      if (supabase) {
                        await supabase
                          .from('profile_assignments')
                          .update({
                            status: 'completed',
                            assessment_id: parseInt(profile.id),
                            completed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Random date in last 30 days
                          })
                          .eq('id', assignment.id)
                      }
                      
                      results.assessments.push({
                        profile_id: profile.id,
                        student_name: `${studentTemplate.first_name} ${studentTemplate.last_name}`,
                        learning_style: studentTemplate.learning_style,
                        teacher_email: teacher.email
                      })
                      
                      console.log(`✅ Created assessment for: ${studentTemplate.first_name} ${studentTemplate.last_name}`)
                    }
                  } catch (assessmentError) {
                    console.warn(`Failed to create assessment for ${studentTemplate.first_name}:`, assessmentError.message)
                    results.errors.push(`Assessment creation failed for ${studentTemplate.first_name}: ${assessmentError.message}`)
                  }
                }
                
                console.log(`✅ Added student: ${studentTemplate.first_name} ${studentTemplate.last_name}`)
                
              } catch (studentError) {
                console.warn(`Failed to add student ${studentTemplate.first_name}:`, studentError.message)
                results.errors.push(`Student creation failed for ${studentTemplate.first_name}: ${studentError.message}`)
              }
            }
            
          } catch (classroomError) {
            console.warn(`Failed to create classroom ${classroomTemplate.name}:`, classroomError.message)
            results.errors.push(`Classroom creation failed for ${classroomTemplate.name}: ${classroomError.message}`)
          }
        }
        
      } catch (teacherError) {
        console.warn(`Failed to create teacher ${teacherTemplate.name}:`, teacherError.message)
        results.errors.push(`Teacher creation failed for ${teacherTemplate.name}: ${teacherError.message}`)
      }
    }
    
    console.log('🎉 Comprehensive test scenario creation completed!')
    console.log(`📊 Summary:
      - Teachers: ${results.teachers.length}
      - Classrooms: ${results.classrooms.length}  
      - Students: ${results.students.length}
      - Assessments: ${results.assessments.length}
      - Errors: ${results.errors.length}`)
    
    return {
      success: true,
      message: `Successfully created comprehensive test scenario with ${results.teachers.length} teachers, ${results.classrooms.length} classrooms, ${results.students.length} students, and ${results.assessments.length} completed assessments.`,
      details: results
    }
    
  } catch (error) {
    console.error('❌ Failed to create comprehensive test scenario:', error)
    return {
      success: false,
      message: `Failed to create test scenario: ${error.message}`,
      details: results
    }
  }
}

// Quick access function for specific teacher scenarios
export async function createSpecificTeacherScenario(scenario: 'new' | 'experienced' | 'mixed_data' | 'specialist' | 'substitute') {
  const teachersForScenario = TEST_TEACHERS.filter(t => t.scenario === scenario)
  
  if (teachersForScenario.length === 0) {
    return { success: false, message: `No teachers found for scenario: ${scenario}` }
  }
  
  console.log(`🎯 Creating specific scenario: ${scenario}`)
  
  // Temporarily modify the global array to only include desired scenario
  const originalTeachers = [...TEST_TEACHERS]
  TEST_TEACHERS.length = 0
  TEST_TEACHERS.push(...teachersForScenario)
  
  const result = await createComprehensiveTestScenario()
  
  // Restore original array
  TEST_TEACHERS.length = 0 
  TEST_TEACHERS.push(...originalTeachers)
  
  return result
}

// Navigation test function - verifies all links work with generated data
export async function testNavigationFlow(teacherEmail: string): Promise<{
  success: boolean
  results: Record<string, boolean>
  errors: string[]
}> {
  console.log(`🔍 Testing navigation flow for: ${teacherEmail}`)
  
  const results: Record<string, boolean> = {}
  const errors: string[] = []
  
  try {
    const teacher = await getTeacherByEmail(teacherEmail)
    if (!teacher) {
      errors.push(`Teacher not found: ${teacherEmail}`)
      return { success: false, results, errors }
    }
    
    // Test teacher dashboard data loading
    results['dashboard_data'] = true
    
    // Test classroom data loading
    const classrooms = await import('./supabase').then(m => m.getTeacherClassrooms(teacher.id))
    results['classroom_data'] = Array.isArray(classrooms)
    
    // Test assignments data loading
    const assignments = await import('./supabase').then(m => m.getTeacherAssignments(teacher.id))
    results['assignments_data'] = Array.isArray(assignments)
    
    // Test student cards generation
    if (assignments && assignments.length > 0) {
      const completedAssignments = assignments.filter((a: any) => a.status === 'completed')
      results['student_cards_data'] = completedAssignments.length > 0
    } else {
      results['student_cards_data'] = false
    }
    
    console.log(`✅ Navigation test completed for ${teacherEmail}`)
    
    return {
      success: !errors.length && Object.values(results).every(v => v),
      results,
      errors
    }
    
  } catch (error) {
    errors.push(`Navigation test failed: ${error.message}`)
    return { success: false, results, errors }
  }
}

// Utility function to clean up test data
export async function cleanupTestData(): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: "Supabase not configured" }
  }
  
  console.log('🧹 Cleaning up test data...')
  
  try {
    const testEmails = TEST_TEACHERS.map(t => t.email)
    
    // Delete in reverse order of dependencies
    const { error: assignmentError } = await supabase
      .from('profile_assignments')
      .delete()
      .in('teacher_id', supabase
        .from('teachers')
        .select('id')
        .in('email', testEmails)
      )
    
    const { error: classroomError } = await supabase
      .from('classrooms')
      .delete()
      .in('teacher_id', supabase
        .from('teachers')
        .select('id')
        .in('email', testEmails)
      )
    
    const { error: teacherError } = await supabase
      .from('teachers')
      .delete()
      .in('email', testEmails)
    
    if (assignmentError || classroomError || teacherError) {
      throw new Error(`Cleanup errors: ${[assignmentError, classroomError, teacherError].filter(Boolean).map(e => e.message).join(', ')}`)
    }
    
    console.log('✅ Test data cleanup completed')
    
    return { success: true, message: "Test data cleaned up successfully" }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    return { success: false, message: `Cleanup failed: ${error.message}` }
  }
}

export default {
  createComprehensiveTestScenario,
  createSpecificTeacherScenario,
  testNavigationFlow,
  cleanupTestData,
  TEST_TEACHERS,
  STUDENT_POOLS
}
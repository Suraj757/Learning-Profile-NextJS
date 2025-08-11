// Seed real student data for suraj+1@speakaboos.com
import { supabase, createClassroom, createProfileAssignment } from './supabase'

export async function seedRealDataForSuraj() {
  if (!supabase) {
    console.log('Supabase not available, skipping real data seeding')
    return
  }

  const teacherId = 1001 // suraj+1@speakaboos.com
  
  try {
    // Check if real data already exists
    const { data: existingClassrooms } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', teacherId)
      .limit(1)

    if (existingClassrooms && existingClassrooms.length > 0) {
      console.log('Real data already exists for teacher', teacherId)
      return
    }

    console.log('Creating real data for suraj+1@speakaboos.com (teacher', teacherId + ')')

    // Create real classroom
    const classroom = await createClassroom(teacherId, {
      name: "Suraj's 3rd Grade",
      grade_level: '3rd Grade',
      school_year: '2024-2025'
    })

    // Create assignments for the real students (from image)
    const realStudents = [
      { name: 'Maya Patel', email: 'parent5@example.com' },
      { name: 'Aiden Wilson', email: 'parent4@example.com' }, 
      { name: 'Sofia Rodriguez', email: 'parent3@example.com' },
      { name: 'Liam Chen', email: 'parent2@example.com' },
      { name: 'Emma Johnson', email: 'parent1@example.com' }
    ]

    for (let i = 0; i < realStudents.length; i++) {
      const student = realStudents[i]
      
      // Create completed assignment with assessment results
      const assignment = await createProfileAssignment({
        teacher_id: teacherId,
        classroom_id: classroom.id,
        child_name: student.name,
        parent_email: student.email,
        assignment_token: `real_token_${i + 1}`,
        status: i < 2 ? 'completed' : 'pending' // First 2 completed, rest pending
      })

      // Add assessment results for completed assignments
      if (i < 2) {
        const assessmentResults = {
          personality_label: i === 0 ? 'Creative Thinker' : 'Analytical Learner',
          scores: {
            creative: i === 0 ? 0.8 : 0.3,
            analytical: i === 0 ? 0.4 : 0.9,
            collaborative: 0.6,
            confident: 0.5
          },
          raw_responses: {
            interests: i === 0 ? ['Art', 'Reading', 'Music'] : ['Math', 'Science', 'Puzzles'],
            engagement: i === 0 ? 'Visual' : 'Logical',
            modality: i === 0 ? 'Kinesthetic' : 'Auditory',
            social: i === 0 ? 'Small Groups' : 'Individual'
          }
        }

        // Update assignment with results
        await supabase
          .from('profile_assignments')
          .update({ 
            assessment_results: assessmentResults,
            completed_at: new Date().toISOString()
          })
          .eq('id', assignment.id)
      }
    }

    console.log('✅ Successfully created real data for suraj+1@speakaboos.com')
    
  } catch (error) {
    console.error('Failed to create real data:', error)
    throw error
  }
}
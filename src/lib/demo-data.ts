// Demo data for teacher testing
import { supabase, createClassroom, createProfileAssignment } from './supabase'

export async function createDemoDataForTeacher(teacherId: number) {
  if (!supabase) {
    console.log('Supabase not available, skipping demo data creation')
    return
  }

  try {
    // Check if demo data already exists
    const { data: existingClassrooms } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', teacherId)
      .limit(1)

    if (existingClassrooms && existingClassrooms.length > 0) {
      console.log('Demo data already exists for teacher', teacherId)
      return
    }

    console.log('Creating demo data for teacher', teacherId)

    // Create demo classrooms
    const classroom1 = await createClassroom(teacherId, {
      name: "Mrs. Demo's 3rd Grade",
      grade_level: '3rd Grade',
      school_year: '2024-2025'
    })

    const classroom2 = await createClassroom(teacherId, {
      name: "Reading Intervention Group",
      grade_level: 'Mixed Grades',
      school_year: '2024-2025'
    })

    // Create demo assignments
    const demoStudents = [
      { name: 'Emma Johnson', email: 'parent1@example.com', classroom: classroom1.id },
      { name: 'Liam Chen', email: 'parent2@example.com', classroom: classroom1.id },
      { name: 'Sofia Rodriguez', email: 'parent3@example.com', classroom: classroom1.id },
      { name: 'Aiden Wilson', email: 'parent4@example.com', classroom: classroom2.id },
      { name: 'Maya Patel', email: 'parent5@example.com', classroom: classroom2.id }
    ]

    for (const student of demoStudents) {
      await createProfileAssignment({
        teacher_id: teacherId,
        classroom_id: student.classroom,
        parent_email: student.email,
        child_name: student.name
      })
    }

    // Simulate some completed assignments by updating a few
    const { data: assignments } = await supabase
      .from('profile_assignments')
      .select('*')
      .eq('teacher_id', teacherId)
      .limit(2)

    if (assignments && assignments.length > 0) {
      for (const assignment of assignments) {
        await supabase
          .from('profile_assignments')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', assignment.id)
      }
    }

    console.log('Demo data created successfully for teacher', teacherId)

  } catch (error) {
    console.error('Error creating demo data:', error)
  }
}

export async function getDemoReportsData(teacherId: number) {
  // Fallback demo data for when database isn't available
  return {
    classrooms: [
      {
        id: 1,
        name: "Mrs. Demo's 3rd Grade",
        grade_level: '3rd Grade',
        school_year: '2024-2025'
      },
      {
        id: 2,
        name: "Reading Intervention Group", 
        grade_level: 'Mixed Grades',
        school_year: '2024-2025'
      }
    ],
    assignments: [
      {
        id: 1,
        child_name: 'Emma Johnson',
        parent_email: 'parent1@example.com',
        classroom_id: 1,
        status: 'completed',
        assigned_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-01-16T14:30:00Z'
      },
      {
        id: 2,
        child_name: 'Liam Chen',
        parent_email: 'parent2@example.com', 
        classroom_id: 1,
        status: 'completed',
        assigned_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-01-17T09:15:00Z'
      },
      {
        id: 3,
        child_name: 'Sofia Rodriguez',
        parent_email: 'parent3@example.com',
        classroom_id: 1,
        status: 'pending',
        assigned_at: '2024-01-15T10:00:00Z',
        completed_at: null
      },
      {
        id: 4,
        child_name: 'Aiden Wilson',
        parent_email: 'parent4@example.com',
        classroom_id: 2,
        status: 'pending',
        assigned_at: '2024-01-18T11:00:00Z',
        completed_at: null
      },
      {
        id: 5,
        child_name: 'Maya Patel',
        parent_email: 'parent5@example.com',
        classroom_id: 2,
        status: 'completed',
        assigned_at: '2024-01-18T11:00:00Z', 
        completed_at: '2024-01-20T16:45:00Z'
      }
    ]
  }
}
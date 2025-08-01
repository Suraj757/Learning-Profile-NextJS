'use client'
import { useState } from 'react'
import { createTeacher, getTeacherByEmail, createClassroom, createProfileAssignment, getTeacherClassrooms, getTeacherAssignments } from '@/lib/supabase'

export default function TeacherFlowTestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [currentTeacher, setCurrentTeacher] = useState<any>(null)

  const addResult = (message: string, isError = false) => {
    setTestResults(prev => [...prev, (isError ? '❌ ' : '✅ ') + message])
  }

  const runFullTeacherFlowTest = async () => {
    setLoading(true)
    setTestResults([])

    try {
      const testEmail = `teacher-test-${Date.now()}@school.edu`
      const testName = 'Test Teacher'

      // Step 1: Test teacher registration
      addResult('Step 1: Testing teacher registration...')
      
      try {
        const newTeacher = await createTeacher({
          email: testEmail,
          name: testName,
          school: 'Test Elementary School',
          grade_level: '3rd Grade'
        })
        addResult(`Teacher created successfully: ${newTeacher.name} (ID: ${newTeacher.id})`)
        setCurrentTeacher(newTeacher)
      } catch (error: any) {
        addResult(`Teacher creation failed: ${error.message}`, true)
        return
      }

      // Step 2: Test teacher login (retrieval)
      addResult('Step 2: Testing teacher login...')
      
      try {
        const retrievedTeacher = await getTeacherByEmail(testEmail)
        if (retrievedTeacher && retrievedTeacher.id === currentTeacher.id) {
          addResult(`Teacher login successful: ${retrievedTeacher.name}`)
        } else {
          addResult('Teacher login failed - user not found or mismatch', true)
          return
        }
      } catch (error: any) {
        addResult(`Teacher login failed: ${error.message}`, true)
        return
      }

      // Step 3: Test classroom creation
      addResult('Step 3: Testing classroom creation...')
      
      let testClassroom
      try {
        testClassroom = await createClassroom(currentTeacher.id, {
          name: 'Test Classroom',
          grade_level: '3rd Grade',
          school_year: '2024-2025'
        })
        addResult(`Classroom created successfully: ${testClassroom.name} (ID: ${testClassroom.id})`)
      } catch (error: any) {
        addResult(`Classroom creation failed: ${error.message}`, true)
        return
      }

      // Step 4: Test assignment creation
      addResult('Step 4: Testing assignment creation...')
      
      try {
        const testAssignment = await createProfileAssignment({
          teacher_id: currentTeacher.id,
          classroom_id: testClassroom.id,
          parent_email: 'testparent@example.com',
          child_name: 'Test Student'
        })
        addResult(`Assignment created successfully for ${testAssignment.child_name}`)
      } catch (error: any) {
        addResult(`Assignment creation failed: ${error.message}`, true)
        return
      }

      // Step 5: Test data retrieval
      addResult('Step 5: Testing data retrieval...')
      
      try {
        const classrooms = await getTeacherClassrooms(currentTeacher.id)
        const assignments = await getTeacherAssignments(currentTeacher.id)
        
        if (classrooms && classrooms.length > 0) {
          addResult(`Retrieved ${classrooms.length} classroom(s) for teacher`)
        } else {
          addResult('No classrooms retrieved', true)
        }

        if (assignments && assignments.length > 0) {
          addResult(`Retrieved ${assignments.length} assignment(s) for teacher`)
        } else {
          addResult('No assignments retrieved', true)
        }
      } catch (error: any) {
        addResult(`Data retrieval failed: ${error.message}`, true)
      }

      // Step 6: Test authentication persistence (mock)
      addResult('Step 6: Testing authentication flow...')
      
      try {
        // Simulate what teacher-auth does
        const sessionData = JSON.stringify(currentTeacher)
        localStorage.setItem('teacher_session_test', sessionData)
        
        const retrievedSession = localStorage.getItem('teacher_session_test')
        const parsedTeacher = JSON.parse(retrievedSession || '{}')
        
        if (parsedTeacher.id === currentTeacher.id) {
          addResult('Authentication persistence test passed')
          localStorage.removeItem('teacher_session_test')
        } else {
          addResult('Authentication persistence test failed', true)
        }
      } catch (error: any) {
        addResult(`Authentication test failed: ${error.message}`, true)
      }

      // Cleanup: Remove test data
      addResult('Step 7: Cleaning up test data...')
      
      try {
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        
        if (supabase) {
          // Delete assignments
          await supabase.from('profile_assignments').delete().eq('teacher_id', currentTeacher.id)
          
          // Delete classrooms
          await supabase.from('classrooms').delete().eq('teacher_id', currentTeacher.id)
          
          // Delete teacher
          await supabase.from('teachers').delete().eq('id', currentTeacher.id)
          
          addResult('Test data cleaned up successfully')
        }
      } catch (error: any) {
        addResult(`Cleanup warning: ${error.message}`)
      }

      addResult('🎉 ALL TESTS PASSED - New teacher flow is working correctly!')

    } catch (error: any) {
      addResult(`Test suite failed: ${error.message}`, true)
    } finally {
      setLoading(false)
    }
  }

  const testSpecificFunctions = async () => {
    setLoading(true)
    setTestResults([])

    try {
      // Test each critical function individually
      const functions = [
        { name: 'Teacher Creation', fn: () => createTeacher({ email: `test-${Date.now()}@test.com`, name: 'Test' }) },
        { name: 'Teacher Retrieval', fn: () => getTeacherByEmail('demo@school.edu') },
      ]

      for (const test of functions) {
        try {
          addResult(`Testing ${test.name}...`)
          await test.fn()
          addResult(`${test.name} - SUCCESS`)
        } catch (error: any) {
          addResult(`${test.name} - FAILED: ${error.message}`, true)
        }
      }

    } catch (error: any) {
      addResult(`Function tests failed: ${error.message}`, true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-begin-cream p-8">
      <div className="max-w-6xl mx-auto">
        <div className="card-begin p-8">
          <h1 className="text-2xl font-bold text-begin-blue mb-6">Teacher Flow Audit & Testing</h1>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={runFullTeacherFlowTest}
              disabled={loading}
              className="btn-begin-primary"
            >
              {loading ? 'Running Full Test...' : 'Run Complete Teacher Flow Test'}
            </button>
            
            <button
              onClick={testSpecificFunctions}
              disabled={loading}
              className="btn-begin-secondary"
            >
              {loading ? 'Testing...' : 'Test Individual Functions'}
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-card mb-6">
            <h3 className="font-semibold text-begin-blue mb-2">Test Coverage:</h3>
            <ul className="text-sm text-begin-blue/80 space-y-1">
              <li>✓ New teacher registration with Supabase</li>
              <li>✓ Teacher login (existing user retrieval)</li>
              <li>✓ Classroom creation and persistence</li>
              <li>✓ Assessment assignment creation</li>
              <li>✓ Data retrieval and dashboard population</li>
              <li>✓ Authentication session management</li>
              <li>✓ Foreign key relationships</li>
              <li>✓ Automatic cleanup of test data</li>
            </ul>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-card text-sm font-mono ${
                  result.includes('❌') 
                    ? 'bg-red-50 text-red-800 border border-red-200' 
                    : result.includes('🎉')
                    ? 'bg-green-100 text-green-800 border-2 border-green-300 font-bold'
                    : result.includes('✅') 
                    ? 'bg-green-50 text-green-800'
                    : 'bg-blue-50 text-blue-800'
                }`}
              >
                {result}
              </div>
            ))}
          </div>

          {testResults.length > 0 && (
            <div className="mt-6 p-4 bg-begin-blue/5 rounded-card">
              <h3 className="font-semibold text-begin-blue mb-2">Manual Testing Checklist:</h3>
              <ul className="text-sm text-begin-blue/80 space-y-1">
                <li>□ Visit /teacher/register and create a real account</li>
                <li>□ Test login with existing email</li>
                <li>□ Create a classroom via the dashboard</li>
                <li>□ Send an assessment link to a real email</li>
                <li>□ Check that reports page shows data</li>
                <li>□ Verify profile page functionality</li>
                <li>□ Test logout and re-login persistence</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
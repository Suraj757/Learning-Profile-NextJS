'use client'
import { useState } from 'react'
import { supabase, createTeacher, getTeacherByEmail } from '@/lib/supabase'

export default function SupabaseTestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message])
  }

  const runTests = async () => {
    setLoading(true)
    setTestResults([])

    try {
      // Test 1: Check Supabase connection
      addResult('Testing Supabase connection...')
      if (!supabase) {
        addResult('❌ Supabase client not initialized')
        return
      }
      addResult('✅ Supabase client initialized')

      // Test 2: Test basic query
      addResult('Testing basic query...')
      const { data, error } = await supabase.from('teachers').select('count').limit(1)
      if (error) {
        addResult(`❌ Basic query failed: ${error.message}`)
      } else {
        addResult('✅ Basic query successful')
      }

      // Test 3: Test teacher creation
      addResult('Testing teacher creation...')
      const testEmail = `test-${Date.now()}@example.com`
      try {
        const newTeacher = await createTeacher({
          email: testEmail,
          name: 'Test Teacher',
          school: 'Test School',
          grade_level: '3rd Grade'
        })
        addResult(`✅ Teacher created successfully: ${newTeacher.name}`)

        // Test 4: Test teacher retrieval
        addResult('Testing teacher retrieval...')
        const retrievedTeacher = await getTeacherByEmail(testEmail)
        if (retrievedTeacher) {
          addResult(`✅ Teacher retrieved successfully: ${retrievedTeacher.name}`)
        } else {
          addResult('❌ Failed to retrieve created teacher')
        }

        // Cleanup: Delete test teacher
        addResult('Cleaning up test data...')
        const { error: deleteError } = await supabase
          .from('teachers')
          .delete()
          .eq('email', testEmail)
        
        if (deleteError) {
          addResult(`⚠️ Failed to cleanup test data: ${deleteError.message}`)
        } else {
          addResult('✅ Test data cleaned up')
        }

      } catch (err: any) {
        addResult(`❌ Teacher creation failed: ${err.message}`)
      }

    } catch (error: any) {
      addResult(`❌ Test failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-begin-cream p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card-begin p-8">
          <h1 className="text-2xl font-bold text-begin-blue mb-6">Supabase Connection Test</h1>
          
          <button
            onClick={runTests}
            disabled={loading}
            className="btn-begin-primary mb-6"
          >
            {loading ? 'Running Tests...' : 'Run Connection Tests'}
          </button>

          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-card text-sm font-mono ${
                  result.includes('❌') 
                    ? 'bg-red-50 text-red-800' 
                    : result.includes('✅') 
                    ? 'bg-green-50 text-green-800'
                    : result.includes('⚠️')
                    ? 'bg-yellow-50 text-yellow-800'
                    : 'bg-gray-50 text-gray-800'
                }`}
              >
                {result}
              </div>
            ))}
          </div>

          {testResults.length > 0 && (
            <div className="mt-6 p-4 bg-begin-blue/5 rounded-card">
              <h3 className="font-semibold text-begin-blue mb-2">Next Steps:</h3>
              <ul className="text-sm text-begin-blue/80 space-y-1">
                <li>• If all tests pass, teacher registration should work on production</li>
                <li>• If tests fail, check your Supabase credentials in .env.local</li>
                <li>• Make sure the database schema has been applied to your Supabase project</li>
                <li>• Verify RLS policies allow the operations above</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
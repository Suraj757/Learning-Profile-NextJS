'use client'
import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Database, CheckCircle, XCircle, Loader } from 'lucide-react'

export default function TestDatabasePage() {
  const [testResults, setTestResults] = useState<{
    connection: 'pending' | 'success' | 'error'
    createProfile: 'pending' | 'success' | 'error'
    retrieveProfile: 'pending' | 'success' | 'error'
    shareProfile: 'pending' | 'success' | 'error'
  }>({
    connection: 'pending',
    createProfile: 'pending',
    retrieveProfile: 'pending',
    shareProfile: 'pending'
  })
  
  const [testOutput, setTestOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [shareToken, setShareToken] = useState<string | null>(null)

  const log = (message: string) => {
    setTestOutput(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestOutput([])
    
    // Reset test results
    setTestResults({
      connection: 'pending',
      createProfile: 'pending',
      retrieveProfile: 'pending',
      shareProfile: 'pending'
    })

    // Test 1: Database Connection
    log('Testing database connection...')
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_name: 'Test Child',
          grade: 'Test Grade',
          responses: { 1: 4, 2: 5, 3: 3 }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProfileId(data.profile.id)
        setShareToken(data.profile.share_token)
        log('✅ Database connection successful')
        log(`✅ Profile created with ID: ${data.profile.id}`)
        setTestResults(prev => ({ ...prev, connection: 'success', createProfile: 'success' }))
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      log(`❌ Database connection failed: ${error}`)
      setTestResults(prev => ({ ...prev, connection: 'error', createProfile: 'error' }))
      setIsRunning(false)
      return
    }

    // Test 2: Retrieve Profile
    if (profileId) {
      log('Testing profile retrieval...')
      try {
        const response = await fetch(`/api/profiles/${profileId}`)
        
        if (response.ok) {
          const data = await response.json()
          log('✅ Profile retrieval successful')
          log(`✅ Retrieved profile for: ${data.profile.child_name}`)
          setTestResults(prev => ({ ...prev, retrieveProfile: 'success' }))
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        log(`❌ Profile retrieval failed: ${error}`)
        setTestResults(prev => ({ ...prev, retrieveProfile: 'error' }))
      }
    }

    // Test 3: Share Profile
    if (shareToken) {
      log('Testing profile sharing...')
      try {
        const response = await fetch(`/api/share/${shareToken}`)
        
        if (response.ok) {
          const data = await response.json()
          log('✅ Profile sharing successful')
          log(`✅ Shared profile accessible via token: ${shareToken}`)
          setTestResults(prev => ({ ...prev, shareProfile: 'success' }))
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        log(`❌ Profile sharing failed: ${error}`)
        setTestResults(prev => ({ ...prev, shareProfile: 'error' }))
      }
    }

    log('🎉 All tests completed!')
    setIsRunning(false)
  }

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Loader className="h-5 w-5 text-gray-400 animate-spin" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  return (
    <div className="min-h-screen bg-begin-cream">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-begin-blue" />
              <span className="text-2xl font-bold text-begin-blue">Begin Learning Profile</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/assessment/start" className="btn-begin-secondary">
                Assessment
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-begin p-8">
          <div className="text-center mb-8">
            <div className="bg-begin-teal/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Database className="h-10 w-10 text-begin-teal" />
            </div>
            <h1 className="text-begin-display font-bold text-begin-blue mb-4">
              Database Connection Test
            </h1>
            <p className="text-begin-body text-gray-600 max-w-2xl mx-auto">
              This page tests the Supabase database integration for the Learning Profile platform. 
              Run the tests to verify that profiles can be created, retrieved, and shared.
            </p>
          </div>

          {/* Test Results */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-begin-blue mb-4">Test Results</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <span className="text-sm font-medium">Database Connection</span>
                {getStatusIcon(testResults.connection)}
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <span className="text-sm font-medium">Create Profile</span>
                {getStatusIcon(testResults.createProfile)}
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <span className="text-sm font-medium">Retrieve Profile</span>
                {getStatusIcon(testResults.retrieveProfile)}
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <span className="text-sm font-medium">Share Profile</span>
                {getStatusIcon(testResults.shareProfile)}
              </div>
            </div>
          </div>

          {/* Test Output */}
          {testOutput.length > 0 && (
            <div className="bg-gray-900 text-green-400 rounded-2xl p-6 mb-8 font-mono text-sm">
              <h3 className="text-white font-semibold mb-4">Test Output</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {testOutput.map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* Test Links */}
          {profileId && shareToken && (
            <div className="bg-begin-cyan/5 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-begin-blue mb-4">Test Profile Links</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Direct Profile URL:</span>
                  <Link 
                    href={`/results/${profileId}`} 
                    className="ml-2 text-begin-teal hover:underline"
                    target="_blank"
                  >
                    /results/{profileId}
                  </Link>
                </div>
                <div>
                  <span className="font-medium">Shareable Profile URL:</span>
                  <Link 
                    href={`/share/${shareToken}`}
                    className="ml-2 text-begin-teal hover:underline"
                    target="_blank"
                  >
                    /share/{shareToken}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Run Tests Button */}
          <div className="text-center">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="btn-begin-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
            >
              {isRunning ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Database className="h-5 w-5" />
                  Run Database Tests
                </>
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              Make sure you've set up your Supabase database and environment variables. 
              See <code className="bg-gray-100 px-2 py-1 rounded">SUPABASE_SETUP.md</code> for detailed instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
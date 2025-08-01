'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function TestSamplesPage() {
  const [samples, setSamples] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch('/api/sample-profiles?count=3')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()
        setSamples(data.profiles)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    testAPI()
  }, [])

  if (loading) return <div className="p-8">Loading samples...</div>
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sample Profiles Test</h1>
      <p className="mb-4">Found {samples.length} sample profiles:</p>
      
      <div className="space-y-4">
        {samples.map((sample: any) => (
          <div key={sample.id} className="border p-4 rounded">
            <h3 className="font-bold">{sample.childName} ({sample.age} years old)</h3>
            <p className="text-gray-600">{sample.grade} - {sample.personalityLabel}</p>
            <p className="text-sm mt-2">{sample.description}</p>
            <div className="mt-2">
              <Link href={`/demo/${sample.id}`} className="text-blue-600 hover:underline">
                View Full Profile →
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 space-x-4">
        <Link href="/demo" className="bg-blue-600 text-white px-4 py-2 rounded">
          Go to Demo Gallery
        </Link>
        <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
'use client'
import { useEffect, useState } from 'react'
import { observeWebVitals, type WebVitals, checkPerformanceBudget, monitorMemoryUsage } from '../../lib/performance'

interface PerformanceMonitorProps {
  enabled?: boolean
  showDebugInfo?: boolean
}

export default function PerformanceMonitor({ enabled = false, showDebugInfo = false }: PerformanceMonitorProps) {
  const [vitals, setVitals] = useState<WebVitals[]>([])
  const [memoryUsage, setMemoryUsage] = useState<ReturnType<typeof monitorMemoryUsage> | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Observe Web Vitals
    observeWebVitals((vital) => {
      setVitals(prev => {
        const existing = prev.find(v => v.name === vital.name)
        if (existing) {
          return prev.map(v => v.name === vital.name ? vital : v)
        }
        return [...prev, vital]
      })

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        const emoji = vital.rating === 'good' ? '✅' : vital.rating === 'needs-improvement' ? '⚠️' : '❌'
        console.log(`${emoji} ${vital.name}: ${vital.value} (${vital.rating})`)
      }

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        sendToAnalytics(vital)
      }
    })

    // Monitor memory usage periodically
    const memoryInterval = setInterval(() => {
      const usage = monitorMemoryUsage()
      if (usage) {
        setMemoryUsage(usage)
      }
    }, 5000)

    return () => clearInterval(memoryInterval)
  }, [enabled])

  // Send vitals to analytics service
  const sendToAnalytics = (vital: WebVitals) => {
    // This would integrate with your analytics service
    // Example: Google Analytics 4, Vercel Analytics, etc.
    if (typeof gtag !== 'undefined') {
      gtag('event', vital.name, {
        value: Math.round(vital.name === 'CLS' ? vital.value * 1000 : vital.value),
        metric_rating: vital.rating,
        custom_map: { metric_id: vital.id }
      })
    }

    // Example: Send to Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', 'Web Vital', { 
        name: vital.name, 
        value: vital.value, 
        rating: vital.rating 
      })
    }
  }

  if (!enabled || !showDebugInfo) return null

  const budgetCheck = checkPerformanceBudget(vitals)

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50 text-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-800">Performance Monitor</h3>
        <div className={`w-2 h-2 rounded-full ${budgetCheck.passed ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      
      <div className="space-y-1">
        {vitals.map(vital => (
          <div key={vital.name} className="flex justify-between items-center">
            <span className="text-gray-600">{vital.name}:</span>
            <span className={`font-mono ${
              vital.rating === 'good' ? 'text-green-600' : 
              vital.rating === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {vital.name === 'CLS' ? vital.value.toFixed(3) : `${Math.round(vital.value)}${vital.name === 'FID' || vital.name === 'LCP' || vital.name === 'FCP' ? 'ms' : ''}`}
            </span>
          </div>
        ))}
        
        {memoryUsage && (
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Memory:</span>
              <span className="font-mono text-gray-800">{memoryUsage.usedJSHeapSize}MB</span>
            </div>
          </div>
        )}
        
        {!budgetCheck.passed && (
          <div className="border-t pt-2 mt-2">
            <div className="text-red-600 text-xs">
              <div className="font-semibold">Budget Violations:</div>
              {budgetCheck.violations.map((violation, i) => (
                <div key={i} className="truncate">{violation}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Hook for accessing performance data
export function usePerformanceVitals() {
  const [vitals, setVitals] = useState<WebVitals[]>([])

  useEffect(() => {
    observeWebVitals((vital) => {
      setVitals(prev => {
        const existing = prev.find(v => v.name === vital.name)
        if (existing) {
          return prev.map(v => v.name === vital.name ? vital : v)
        }
        return [...prev, vital]
      })
    })
  }, [])

  return vitals
}
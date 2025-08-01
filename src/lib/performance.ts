// Performance monitoring utilities

export interface WebVitals {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
}

// Web Vitals thresholds
const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTI: { good: 3800, poor: 7300 },
  TTFB: { good: 800, poor: 1800 }
}

export function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name as keyof typeof WEB_VITALS_THRESHOLDS]
  if (!thresholds) return 'good'
  
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

// Performance observer for Core Web Vitals
export function observeWebVitals(onVital: (vital: WebVitals) => void) {
  if (typeof window === 'undefined') return

  // Import web-vitals dynamically to avoid SSR issues
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    onCLS((metric) => {
      onVital({
        id: metric.id,
        name: 'CLS',
        value: metric.value,
        rating: getRating('CLS', metric.value),
        delta: metric.delta
      })
    })

    onFID((metric) => {
      onVital({
        id: metric.id,
        name: 'FID',
        value: metric.value,
        rating: getRating('FID', metric.value),
        delta: metric.delta
      })
    })

    onFCP((metric) => {
      onVital({
        id: metric.id,
        name: 'FCP',
        value: metric.value,
        rating: getRating('FCP', metric.value),
        delta: metric.delta
      })
    })

    onLCP((metric) => {
      onVital({
        id: metric.id,
        name: 'LCP',
        value: metric.value,
        rating: getRating('LCP', metric.value),
        delta: metric.delta
      })
    })

    onTTFB((metric) => {
      onVital({
        id: metric.id,
        name: 'TTFB',
        value: metric.value,
        rating: getRating('TTFB', metric.value),
        delta: metric.delta
      })
    })
  }).catch((error) => {
    console.warn('Failed to load web-vitals:', error)
  })
}

// Performance timing utilities
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  if (typeof window === 'undefined') return fn()

  const start = performance.now()
  const result = fn()

  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`)
    })
  } else {
    const duration = performance.now() - start
    console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`)
    return result
  }
}

// Resource hints for preloading
export function preloadResource(href: string, as: string, type?: string) {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (type) link.type = type
  document.head.appendChild(link)
}

export function preconnectOrigin(href: string, crossorigin = false) {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = href
  if (crossorigin) link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

// Bundle analysis helpers
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return

  const scripts = Array.from(document.querySelectorAll('script[src]'))
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
  
  console.group('📦 Bundle Analysis')
  console.log(`Scripts: ${scripts.length}`)
  console.log(`Stylesheets: ${styles.length}`)
  
  // Estimate total size (approximate)
  const totalElements = scripts.length + styles.length
  console.log(`Total resources: ${totalElements}`)
  console.groupEnd()
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return

  const memory = (performance as any).memory
  
  return {
    usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
    totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
    jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
  }
}

// Network quality detection
export function detectNetworkQuality(): 'slow' | 'fast' | 'unknown' {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) return 'unknown'

  const connection = (navigator as any).connection
  if (!connection) return 'unknown'

  const { effectiveType, downlink } = connection
  
  // Consider 2G/slow-2G as slow, 4G as fast
  if (effectiveType === '2g' || effectiveType === 'slow-2g' || downlink < 1) {
    return 'slow'
  }
  
  return 'fast'
}

// Critical resource loading
export function loadCriticalResources() {
  // Preload critical fonts
  preloadResource('/fonts/inter-var.woff2', 'font', 'font/woff2')
  
  // Preconnect to external services
  preconnectOrigin('https://fonts.googleapis.com')
  preconnectOrigin('https://fonts.gstatic.com', true)
}

// Performance budget checker
export interface PerformanceBudget {
  maxLCP: number // milliseconds
  maxFID: number // milliseconds
  maxCLS: number // score
  maxBundleSize: number // KB
  maxImageSize: number // KB
}

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  maxLCP: 2500,
  maxFID: 100,
  maxCLS: 0.1,
  maxBundleSize: 300,
  maxImageSize: 500
}

export function checkPerformanceBudget(
  vitals: WebVitals[], 
  budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET
) {
  const violations: string[] = []
  
  vitals.forEach(vital => {
    switch (vital.name) {
      case 'LCP':
        if (vital.value > budget.maxLCP) {
          violations.push(`LCP (${vital.value}ms) exceeds budget (${budget.maxLCP}ms)`)
        }
        break
      case 'FID':
        if (vital.value > budget.maxFID) {
          violations.push(`FID (${vital.value}ms) exceeds budget (${budget.maxFID}ms)`)
        }
        break
      case 'CLS':
        if (vital.value > budget.maxCLS) {
          violations.push(`CLS (${vital.value}) exceeds budget (${budget.maxCLS})`)
        }
        break
    }
  })
  
  return {
    passed: violations.length === 0,
    violations
  }
}
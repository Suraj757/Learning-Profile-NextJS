'use client'
import { Suspense, lazy } from 'react'

// Lazy load Framer Motion components to reduce initial bundle size
const motion = lazy(() => import('framer-motion').then(module => ({ default: module.motion })))
const AnimatePresence = lazy(() => import('framer-motion').then(module => ({ default: module.AnimatePresence })))

interface LazyMotionDivProps {
  children: React.ReactNode
  className?: string
  initial?: any
  animate?: any
  exit?: any
  transition?: any
  layoutId?: string
}

function MotionContent({ children, className, initial, animate, exit, transition, layoutId }: LazyMotionDivProps) {
  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      layoutId={layoutId}
    >
      {children}
    </motion.div>
  )
}

export function LazyMotionDiv(props: LazyMotionDivProps) {
  return (
    <Suspense fallback={<div className={props.className}>{props.children}</div>}>
      <MotionContent {...props} />
    </Suspense>
  )
}

interface LazyAnimatePresenceProps {
  children: React.ReactNode
  mode?: 'wait' | 'sync' | 'popLayout'
}

function AnimatePresenceContent({ children, mode }: LazyAnimatePresenceProps) {
  return (
    <AnimatePresence mode={mode}>
      {children}
    </AnimatePresence>
  )
}

export function LazyAnimatePresence(props: LazyAnimatePresenceProps) {
  return (
    <Suspense fallback={<>{props.children}</>}>
      <AnimatePresenceContent {...props} />
    </Suspense>
  )
}

// Commonly used animation presets
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  slideInFromRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.4, ease: 'easeOut' }
  }
}
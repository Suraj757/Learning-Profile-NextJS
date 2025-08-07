import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely formats a numeric value to a fixed number of decimal places
 * Returns a fallback string if the value is not a valid number
 */
export function safeToFixed(value: any, decimals: number = 1, fallback: string = '0.0'): string {
  if (value === null || value === undefined) {
    return fallback
  }
  
  const num = Number(value)
  if (isNaN(num) || !isFinite(num)) {
    return fallback
  }
  
  return num.toFixed(decimals)
}

/**
 * Safely gets a numeric score from the scores object
 * Returns 0 if the score is not a valid number
 */
export function safeScore(scores: Record<string, any>, category: string): number {
  const score = scores[category]
  if (score === null || score === undefined) {
    return 0
  }
  
  const num = Number(score)
  return isNaN(num) || !isFinite(num) ? 0 : num
}
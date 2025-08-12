// Authentication Components Export Barrel
// Enhanced auth system with educational compliance and demo data awareness

// Core authentication components
export { default as LogoutButton } from './LogoutButton'
export { default as PasswordSetupFlow } from './PasswordSetupFlow'
export { default as AuthStateIndicator } from './AuthStateIndicator'
export { default as AuthenticatedHeader } from './AuthenticatedHeader'
export { default as TeacherDashboardHeader } from './TeacherDashboardHeader'

// Authentication hooks and utilities
export { 
  useTeacherAuth,
  useSecureAuth,
  usePermissions,
  useSecurityMonitoring,
  AuthGuard,
  SecureAuthProvider
} from '../../lib/auth/hooks'

// Component prop types
export interface AuthComponentProps {
  variant?: 'button' | 'menu' | 'icon' | 'full' | 'compact' | 'minimal' | 'badge'
  size?: 'sm' | 'md' | 'lg'
  showConfirmDialog?: boolean
  showDetails?: boolean
  className?: string
}

// Auth state types
export type AuthStatus = 
  | 'authenticated' 
  | 'unauthenticated' 
  | 'demo' 
  | 'needs_setup' 
  | 'limited' 
  | 'loading'

/**
 * Authentication Component Integration Guide
 * 
 * These components provide a complete authentication system for educational platforms:
 * 
 * 1. **Setup Authentication Provider**:
 *    ```tsx
 *    import { SecureAuthProvider } from '@/components/auth'
 *    
 *    function Layout({ children }) {
 *      return <SecureAuthProvider>{children}</SecureAuthProvider>
 *    }
 *    ```
 * 
 * 2. **Use Authentication Hook**:
 *    ```tsx
 *    import { useTeacherAuth } from '@/components/auth'
 *    
 *    function Component() {
 *      const { teacher, loading, logout } = useTeacherAuth()
 *      // Use authentication state
 *    }
 *    ```
 * 
 * 3. **Add UI Components**:
 *    ```tsx
 *    import { 
 *      AuthenticatedHeader,
 *      LogoutButton,
 *      AuthStateIndicator 
 *    } from '@/components/auth'
 *    
 *    <AuthenticatedHeader showAuthState={true} />
 *    <AuthStateIndicator variant="compact" />
 *    <LogoutButton variant="menu" />
 *    ```
 * 
 * **Key Features**:
 * - FERPA compliant secure sessions
 * - Demo data awareness and indicators
 * - Mobile-responsive design
 * - Educational UX patterns
 * - TypeScript support
 * - Performance optimized
 * 
 * **Demo**: Visit /auth-demo to see all components in action
 */
import { redirect } from '@tanstack/react-router'
import { authManager } from './auth'

interface RouteProtectionOptions {
  authenticated?: boolean
  permissions?: string[]
  roles?: string[]
  requireAll?: boolean
  redirectTo?: string
}

export function createBeforeLoadGuard(options: RouteProtectionOptions) {
  return async () => {
    // Debug logging
    console.log('[RouteProtection] Checking access with options:', options)
    const canAccess = authManager.canAccess(options)
    console.log('[RouteProtection] Can access?', canAccess)
    
    if (!canAccess) {
      // Determine redirect path
      let redirectPath = options.redirectTo || '/auth/login'
      
      // If user is authenticated but lacks permissions, might redirect to forbidden page
      if (authManager.isAuthenticated() && (options.permissions || options.roles)) {
        console.log('[RouteProtection] User is authenticated but lacks permissions')
        redirectPath = '/forbidden'
      }
      
      console.log('[RouteProtection] Redirecting to:', redirectPath)
      throw redirect({
        to: redirectPath
      })
    }
  }
}

// Pre-defined guards for common scenarios
export const requireAuth = createBeforeLoadGuard({ 
  authenticated: true 
})

// Single role requirement
export const requireRole = (role: string) => createBeforeLoadGuard({ 
  authenticated: true,
  roles: [role]
})

// Multiple roles (any)
export const requireAnyRole = (...roles: string[]) => createBeforeLoadGuard({ 
  authenticated: true,
  roles,
  requireAll: false
})

// Multiple roles (all)
export const requireAllRoles = (...roles: string[]) => createBeforeLoadGuard({ 
  authenticated: true,
  roles,
  requireAll: true
})

export const requirePermission = (...permissions: string[]) => createBeforeLoadGuard({ 
  authenticated: true,
  permissions,
  requireAll: false
})

export const requireAllPermissions = (...permissions: string[]) => createBeforeLoadGuard({
  authenticated: true,
  permissions,
  requireAll: true
})

// Require email verification
export const requireEmailVerified = createBeforeLoadGuard({
  authenticated: true,
  redirectTo: '/auth/verify-email'
})
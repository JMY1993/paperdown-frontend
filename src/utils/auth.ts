import { 
  parseJWT, 
  isTokenExpired, 
  getTokenFromStorage, 
  setTokenToStorage, 
  removeTokenFromStorage,
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
  type JWTPayload
} from './jwt'

export class AuthManager {
  private static instance: AuthManager
  
  private constructor() {}
  
  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }
  
  // Token management
  setToken(token: string): void {
    setTokenToStorage(token)
  }
  
  getToken(): string | null {
    const token = getTokenFromStorage()
    if (token && isTokenExpired(token)) {
      this.clearAuth()
      return null
    }
    return token
  }
  
  clearAuth(): void {
    removeTokenFromStorage()
    // Clear any other auth-related data
    localStorage.removeItem('permissions')
    localStorage.removeItem('userData')
  }
  
  // Authentication checks
  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token && !isTokenExpired(token)
  }
  
  // Permission checks
  hasPermission(permission: string): boolean {
    if (!this.isAuthenticated()) return false
    return checkPermission(permission)
  }
  
  hasRole(role: string): boolean {
    return this.hasPermission(`role:${role}`)
  }
  
  hasAnyRole(roles: string[]): boolean {
    const rolePermissions = roles.map(r => `role:${r}`)
    console.log('[AuthManager] hasAnyRole - checking:', rolePermissions)
    const result = checkAnyPermission(rolePermissions)
    console.log('[AuthManager] hasAnyRole - result:', result)
    return result
  }
  
  hasAllRoles(roles: string[]): boolean {
    return checkAllPermissions(roles.map(r => `role:${r}`))
  }
  
  isAdmin(): boolean {
    return this.hasRole('admin')
  }
  
  // User info
  getUser(): Pick<JWTPayload, 'sub' | 'permissions' | 'email' | 'email_verified'> | null {
    const token = this.getToken()
    if (!token) return null
    
    const payload = parseJWT(token)
    if (!payload) return null
    
    return {
      sub: payload.sub,
      permissions: payload.permissions || [],
      email: payload.email,
      email_verified: payload.email_verified
    }
  }
  
  // Email verification check
  isEmailVerified(): boolean {
    if (!this.isAuthenticated()) return false
    const user = this.getUser()
    return user?.email_verified || false
  }
  
  getSessionId(): string | null {
    const token = this.getToken()
    if (!token) return null
    
    const payload = parseJWT(token)
    return payload?.session_id || null
  }
  
  // Route protection helpers
  canAccess(requirements?: {
    authenticated?: boolean
    permissions?: string[]
    roles?: string[]
    requireAll?: boolean
  }): boolean {
    console.log('[AuthManager] canAccess called with:', requirements)
    
    if (!requirements) return true
    
    if (requirements.authenticated && !this.isAuthenticated()) {
      console.log('[AuthManager] Not authenticated')
      return false
    }
    
    if (requirements.permissions) {
      const hasPerms = requirements.requireAll 
        ? checkAllPermissions(requirements.permissions)
        : checkAnyPermission(requirements.permissions)
      console.log('[AuthManager] Permission check:', requirements.permissions, '-> has?', hasPerms)
      if (!hasPerms) return false
    }
    
    if (requirements.roles) {
      console.log('[AuthManager] Checking roles:', requirements.roles)
      const hasRoles = requirements.requireAll
        ? this.hasAllRoles(requirements.roles)
        : this.hasAnyRole(requirements.roles)
      console.log('[AuthManager] Role check result:', hasRoles)
      if (!hasRoles) return false
    }
    
    return true
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance()

// Export types
export type { JWTPayload }
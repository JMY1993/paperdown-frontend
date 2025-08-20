export interface JWTPayload {
  sub: string  // User UUID as standard subject claim
  permissions?: string[]
  session_id?: string
  email: string
  email_verified: boolean
  exp: number
  iat: number
}

export function parseJWT(token: string | null): JWTPayload | null {
  if (!token) return null
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    return payload as JWTPayload
  } catch (error) {
    console.error('Failed to parse JWT:', error)
    return null
  }
}

export function isTokenExpired(token: string | null): boolean {
  const payload = parseJWT(token)
  if (!payload) return true
  
  const now = Date.now() / 1000
  return payload.exp < now
}

export function getTokenFromStorage(): string | null {
  return localStorage.getItem('token')
}

export function setTokenToStorage(token: string): void {
  localStorage.setItem('token', token)
}

export function removeTokenFromStorage(): void {
  localStorage.removeItem('token')
}

export function hasPermission(permission: string): boolean {
  const token = getTokenFromStorage()
  const payload = parseJWT(token)
  
  if (!payload || !payload.permissions) return false
  return payload.permissions.includes(permission)
}

export function hasAnyPermission(permissions: string[]): boolean {
  const token = getTokenFromStorage()
  const payload = parseJWT(token)
  
  console.log('[JWT] hasAnyPermission - checking:', permissions)
  console.log('[JWT] Token payload permissions:', payload?.permissions)
  
  if (!payload || !payload.permissions) {
    console.log('[JWT] No payload or permissions')
    return false
  }
  
  const result = permissions.some(perm => payload.permissions!.includes(perm))
  console.log('[JWT] hasAnyPermission result:', result)
  return result
}

export function hasAllPermissions(permissions: string[]): boolean {
  const token = getTokenFromStorage()
  const payload = parseJWT(token)
  
  if (!payload || !payload.permissions) return false
  return permissions.every(perm => payload.permissions!.includes(perm))
}

export function getUserUUIDFromToken(): string | null {
  const token = getTokenFromStorage()
  const payload = parseJWT(token)
  
  if (!payload) return null
  
  return payload.sub
}
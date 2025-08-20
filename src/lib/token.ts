export interface JWTPayload {
  sub: string  // User UUID
  permissions?: string[]
  session_id?: string
  exp: number
  iat: number
}

export const tokenManager = {
  decode(token: string): JWTPayload | null {
    try {
      const base64Payload = token.split('.')[1]
      const payload = JSON.parse(atob(base64Payload))
      return payload
    } catch {
      return null
    }
  },

  isExpired(token: string): boolean {
    const payload = this.decode(token)
    if (!payload) return true
    
    // exp 是秒级时间戳，需要转换为毫秒
    return Date.now() >= payload.exp * 1000
  },

  getToken(): string | null {
    const token = localStorage.getItem('token')
    if (!token) return null
    
    // 检查是否过期
    if (this.isExpired(token)) {
      localStorage.removeItem('token')
      return null
    }
    
    return token
  },

  setToken(token: string) {
    localStorage.setItem('token', token)
  },

  clearToken() {
    localStorage.removeItem('token')
  },

  getTimeUntilExpiry(token: string): number {
    const payload = this.decode(token)
    if (!payload) return 0
    
    const expiryTime = payload.exp * 1000
    return Math.max(0, expiryTime - Date.now())
  }
}
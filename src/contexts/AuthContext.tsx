import { createContext, useContext, type ReactNode } from 'react'
import { useMe } from '@/services/auth'
import type { User } from '@/services/auth'

interface AuthContextType {
  user: User | undefined
  isLoading: boolean
  isAuthenticated: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error } = useMe()
  
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { tokenManager } from '@/lib/token'

export interface User {
  id: string
  email: string
  username?: string | null
  created_at: string
  updated_at: string
  permissions?: string[]
  email_verified?: boolean
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterResponse {
  token?: string  // Token is optional for register
  user: User
  message?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface UpdateUserRequest {
  email?: string
  username?: string
  current_password?: string
  new_password?: string
}

export interface Session {
  id: string
  user_id: number
  device_info: string
  ip_address: string
  created_at: string
  last_activity: string
  is_current: boolean
}

const authKeys = {
  all: ['auth'],
  me: () => ['auth', 'me'],
  sessions: () => ['auth', 'sessions'],
} as const

export const useLogin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await api.post<LoginResponse>('/auth/login', data)
      return response.data
    },
    onSuccess: async (data) => {
      tokenManager.setToken(data.token)
      // Also set token in authManager for permission checks
      const { authManager } = await import('@/utils/auth')
      authManager.setToken(data.token)
      
      // Proactively fetch user data and cache it, so dashboard has it instantly.
      await queryClient.fetchQuery({
        queryKey: authKeys.me(),
        queryFn: async () => {
          const response = await api.get<{ user: User }>('/me')
          return response.data.user
        },
      })
    },
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await api.post<RegisterResponse>('/auth/register', data)
      return response.data
    },
    onSuccess: async (data) => {
      // Only set token if it exists (auto-login is enabled)
      if (data.token) {
        tokenManager.setToken(data.token)
        // Also set token in authManager for permission checks
        const { authManager } = await import('@/utils/auth')
        authManager.setToken(data.token)
        // Clear all auth-related cache and force fresh fetch
        queryClient.removeQueries({ queryKey: authKeys.all })
        await queryClient.invalidateQueries({ queryKey: authKeys.all })
      }
      // If no token, user needs to login manually
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await api.post('/me/logout')
    },
    onSuccess: async () => {
      // Clear tokens first
      tokenManager.clearToken()
      const { authManager } = await import('@/utils/auth')
      authManager.clearAuth()
      
      // Immediately set user data to undefined to prevent stale data
      queryClient.setQueryData(authKeys.me(), undefined)
      
      // Clear all auth queries
      queryClient.removeQueries({ queryKey: authKeys.all })
      queryClient.clear()
      
      // Force refetch when needed
      queryClient.invalidateQueries()
      
      // Navigate to login page
      window.location.href = '/auth/login'
    },
  })
}

export const useLogoutAll = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await api.delete('/me/sessions')
    },
    onSuccess: async () => {
      // Clear tokens first
      tokenManager.clearToken()
      const { authManager } = await import('@/utils/auth')
      authManager.clearAuth()
      
      // Immediately set user data to undefined to prevent stale data
      queryClient.setQueryData(authKeys.me(), undefined)
      
      // Clear all auth queries
      queryClient.removeQueries({ queryKey: authKeys.all })
      queryClient.clear()
      
      // Force refetch when needed
      queryClient.invalidateQueries()
    },
  })
}

export const useMe = () => {
  const token = tokenManager.getToken()
  
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await api.get<{ user: User }>('/me')
      return response.data.user
    },
    enabled: !!token,
    retry: false,
    // Return undefined immediately when disabled to prevent stale data
    placeholderData: undefined,
  })
}

export const useSessions = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: authKeys.sessions(),
    queryFn: async () => {
      const response = await api.get<{ sessions: Session[] }>('/me/sessions')
      return response.data.sessions
    },
    enabled: !!tokenManager.getToken() && (options?.enabled !== false),
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      const response = await api.patch<{ user: User }>('/me', data)
      return response.data.user
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
  })
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/me/sessions/${sessionId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() })
    },
  })
}
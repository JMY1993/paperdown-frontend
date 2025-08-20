import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'

// Types
interface User {
  id: string
  email: string
  username: string | null
  created_at: string
  updated_at: string
  permissions: string[]
}

interface UsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

interface CreateUserRequest {
  email: string
  password: string
  username?: string
  permissions?: string[]
}

interface UpdateUserRequest {
  email?: string
  username?: string
  password?: string
}

// API Functions
async function fetchUsers(page: number, limit: number): Promise<UsersResponse> {
  const { data } = await axios.get('/admin/users', {
    params: { page, limit }
  })
  return data
}

async function fetchUser(userId: string): Promise<User> {
  const { data } = await axios.get(`/admin/users/${userId}`)
  return data
}

async function createUser(userData: CreateUserRequest): Promise<User> {
  const { data } = await axios.post('/admin/users', userData)
  return data
}

async function updateUser(userId: string, updates: UpdateUserRequest): Promise<User> {
  const { data } = await axios.patch(`/admin/users/${userId}`, updates)
  return data
}

async function deleteUser(userId: string): Promise<void> {
  await axios.delete(`/admin/users/${userId}`)
}

async function fetchUserPermissions(userId: string): Promise<string[]> {
  const { data } = await axios.get(`/admin/users/${userId}/permissions`)
  return data.permissions
}

async function setUserPermissions(userId: string, permissions: string[]): Promise<void> {
  await axios.post(`/admin/users/${userId}/permissions`, { permissions })
}

// Hooks
export function useUsers(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['admin', 'users', page, limit],
    queryFn: () => fetchUsers(page, limit),
  })
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) => 
      updateUser(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.userId] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: ['admin', 'user', userId, 'permissions'],
    queryFn: () => fetchUserPermissions(userId),
    enabled: !!userId,
  })
}

export function useSetUserPermissions() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, permissions }: { userId: string; permissions: string[] }) =>
      setUserPermissions(userId, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'user', variables.userId, 'permissions'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'user', variables.userId] 
      })
    },
  })
}
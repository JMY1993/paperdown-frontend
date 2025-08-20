import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'

// Types
interface QuotaRule {
  type: 'one_time' | 'recurring'
  limit: number
  used: number
  expires_at?: string
  cycle_minutes?: number
  last_reset?: string
}

interface QuotaConfig {
  quotas: QuotaRule[]
}

interface APIKey {
  id: string
  service_name: string
  api_key: string
  api_url?: string
  remark?: string
  priority: number
  cost_per_use: number
  tags?: string[]
  status: 'active' | 'disabled' | 'expired'
  quotas: QuotaConfig
  last_used_at?: string
  created_by?: string
  created_at: string
  updated_at: string
}

interface APIKeysResponse {
  keys: APIKey[]
  total: number
  page: number
  limit: number
}

interface CreateAPIKeyRequest {
  service_name: string
  api_key: string
  api_url?: string
  remark?: string
  priority?: number
  cost_per_use?: number
  tags?: string[]
  quotas: QuotaConfig
  created_by?: string
}

interface UpdateAPIKeyRequest {
  api_url?: string
  remark?: string
  priority?: number
  cost_per_use?: number
  tags?: string[]
  status?: 'active' | 'disabled' | 'expired'
  quotas?: QuotaConfig
}

interface ListAPIKeysParams {
  service_name?: string
  status?: string
  page?: number
  limit?: number
}

// API Functions
async function fetchAPIKeys(params: ListAPIKeysParams = {}): Promise<APIKeysResponse> {
  const { data } = await axios.get('/api/v1/admin/keypool/keys', { params })
  return data
}

async function fetchAPIKey(keyId: string): Promise<APIKey> {
  const { data } = await axios.get(`/api/v1/admin/keypool/keys/${keyId}`)
  return data
}

async function createAPIKey(keyData: CreateAPIKeyRequest): Promise<APIKey> {
  const { data } = await axios.post('/api/v1/admin/keypool/keys', keyData)
  return data
}

async function updateAPIKey(keyId: string, updates: UpdateAPIKeyRequest): Promise<APIKey> {
  const { data } = await axios.patch(`/api/v1/admin/keypool/keys/${keyId}`, updates)
  return data
}

async function deleteAPIKey(keyId: string): Promise<void> {
  await axios.delete(`/api/v1/admin/keypool/keys/${keyId}`)
}

async function resetQuotas(keyId: string): Promise<APIKey> {
  const { data } = await axios.post(`/api/v1/admin/keypool/keys/${keyId}/reset-quotas`)
  return data
}

// Hooks
export function useAPIKeys(params: ListAPIKeysParams = {}) {
  return useQuery({
    queryKey: ['admin', 'keypool', 'keys', params],
    queryFn: () => fetchAPIKeys(params),
  })
}

export function useAPIKey(keyId: string) {
  return useQuery({
    queryKey: ['admin', 'keypool', 'key', keyId],
    queryFn: () => fetchAPIKey(keyId),
    enabled: !!keyId,
  })
}

export function useCreateAPIKey() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createAPIKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'keypool', 'keys'] })
    },
  })
}

export function useUpdateAPIKey() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ keyId, data }: { keyId: string; data: UpdateAPIKeyRequest }) => 
      updateAPIKey(keyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'keypool', 'keys'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'keypool', 'key', variables.keyId] })
    },
  })
}

export function useDeleteAPIKey() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteAPIKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'keypool', 'keys'] })
    },
  })
}

export function useResetQuotas() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: resetQuotas,
    onSuccess: (_, keyId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'keypool', 'keys'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'keypool', 'key', keyId] })
    },
  })
}

// Export types
export type {
  APIKey,
  APIKeysResponse,
  CreateAPIKeyRequest,
  UpdateAPIKeyRequest,
  ListAPIKeysParams,
  QuotaRule,
  QuotaConfig
}
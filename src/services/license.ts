import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'

// Types
export interface ActivationCode {
  id: string
  code: string
  service_name: string
  code_ttl: string | null
  activation_type: 'immediate' | 'fixed'
  service_start_time: string | null
  service_duration: number
  bind_type: 'user' | 'universal'
  stacking_type: 'reject' | 'extend' | 'replace'
  user_uuid: string | null
  max_uses: number | null
  used_count: number
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

export interface License {
  id: string
  user_uuid: string
  service_name: string
  activation_type: 'immediate' | 'fixed'
  service_start_time: string
  service_duration: number
  service_end_time: string
  created_at: string
  updated_at: string
}

export interface CreateActivationCodeRequest {
  service_name: string
  code_ttl?: string
  activation_type: 'immediate' | 'fixed'
  service_start_time?: string
  service_duration: number
  bind_type: 'user' | 'universal'
  stacking_type: 'reject' | 'extend' | 'replace'
  user_uuid?: string
  max_uses?: number
}

export interface UpdateActivationCodeRequest {
  service_name?: string
  code_ttl?: string | null
  activation_type?: 'immediate' | 'fixed'
  service_start_time?: string | null
  service_duration?: number
  bind_type?: 'user' | 'universal'
  stacking_type?: 'reject' | 'extend' | 'replace'
  user_uuid?: string | null
  max_uses?: number | null
}

export interface CreateAndActivateUserRequest {
  code: string
  email: string
  password: string
}

export interface ValidateUserLicenseRequest {
  service_name: string
}

export interface ValidateUserLicenseResponse {
  valid: boolean
  message?: string
  service_name: string
  start_time?: string
  end_time?: string
  days_left?: number
}

export interface CreateAndActivateUserResponse {
  user_uuid: string
  license: License
}

export interface ListActivationCodesResponse {
  activation_codes: ActivationCode[]
  total: number
  page: number
  limit: number
}

// API Functions
async function createActivationCode(data: CreateActivationCodeRequest): Promise<ActivationCode> {
  const { data: response } = await axios.post('/admin/license/activation-codes', data)
  return response
}

async function listActivationCodes(page: number, limit: number): Promise<ListActivationCodesResponse> {
  const { data } = await axios.get('/admin/license/activation-codes', {
    params: { page, limit }
  })
  return data
}

async function getActivationCode(code: string): Promise<ActivationCode> {
  const { data } = await axios.get(`/admin/license/activation-codes/${code}`)
  return data
}

async function updateActivationCode(code: string, data: UpdateActivationCodeRequest): Promise<ActivationCode> {
  const { data: response } = await axios.patch(`/admin/license/activation-codes/${code}`, data)
  return response
}

async function deleteActivationCode(code: string): Promise<void> {
  await axios.delete(`/admin/license/activation-codes/${code}`)
}

async function activateService(code: string): Promise<License> {
  const { data } = await axios.post('/license/activate', {}, {
    params: { code }
  })
  return data
}

async function createAndActivateUser(data: CreateAndActivateUserRequest): Promise<CreateAndActivateUserResponse> {
  const { data: response } = await axios.post('/license/create-and-activate', data)
  return response
}

async function getUserLicenses(): Promise<License[]> {
  const { data } = await axios.get('/license/licenses')
  return data
}

async function getUserLicenseByService(serviceName: string): Promise<License> {
  const { data } = await axios.get(`/license/licenses/${serviceName}`)
  return data
}

async function validateUserLicense(data: ValidateUserLicenseRequest): Promise<ValidateUserLicenseResponse> {
  const { data: response } = await axios.post('/license/validate', data)
  return response
}

// Hooks
export function useCreateActivationCode() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createActivationCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'license', 'activation-codes'] })
    },
  })
}

export function useActivationCodes(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['admin', 'license', 'activation-codes', page, limit],
    queryFn: () => listActivationCodes(page, limit),
  })
}

export function useActivationCode(code: string) {
  return useQuery({
    queryKey: ['admin', 'license', 'activation-codes', code],
    queryFn: () => getActivationCode(code),
    enabled: !!code,
  })
}

export function useUpdateActivationCode() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: UpdateActivationCodeRequest }) => 
      updateActivationCode(code, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'license', 'activation-codes'] })
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'license', 'activation-codes', variables.code] 
      })
    },
  })
}

export function useDeleteActivationCode() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteActivationCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'license', 'activation-codes'] })
    },
  })
}

export function useActivateService() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: activateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license', 'licenses'] })
    },
  })
}

export function useCreateAndActivateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createAndActivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license', 'licenses'] })
    },
  })
}

export function useUserLicenses() {
  return useQuery({
    queryKey: ['license', 'licenses'],
    queryFn: getUserLicenses,
  })
}

export function useUserLicenseByService(serviceName: string) {
  return useQuery({
    queryKey: ['license', 'licenses', serviceName],
    queryFn: () => getUserLicenseByService(serviceName),
    enabled: !!serviceName,
  })
}

export function useValidateUserLicense() {
  return useMutation({
    mutationFn: validateUserLicense,
  })
}
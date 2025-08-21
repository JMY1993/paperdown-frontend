import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface LogEntry {
  id: number
  time: string
  level: string
  message: string
  request_id?: string
  user_id?: string
  ip?: string
  method?: string
  path?: string
  status?: number
  latency_ms?: number
  event_type?: string
  event_data?: string
  created_at: string
}

export interface LogsResponse {
  logs: LogEntry[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export interface LogStats {
  time_range_hours: number
  level_stats: Record<string, number>
  event_stats: Record<string, number>
  hourly_stats: Array<{
    hour: string
    count: number
  }>
}

export interface LogFilters {
  page?: number
  limit?: number
  level?: string
  event_type?: string
  user_id?: string
  start_time?: string
  end_time?: string
  log_file?: string
}

export interface LogFileInfo {
  path: string
  display_name: string
  size: number
  mod_time: string
  log_count: number
}

export interface LogFilesResponse {
  files: LogFileInfo[]
}

const logsKeys = {
  all: ['logs'],
  logs: (filters: LogFilters) => ['logs', 'list', filters],
  stats: (hours: number) => ['logs', 'stats', hours],
  files: () => ['logs', 'files'],
} as const

export const useLogs = (filters: LogFilters = {}, refetchInterval?: number) => {
  return useQuery({
    queryKey: logsKeys.logs(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.limit) params.set('limit', filters.limit.toString())
      if (filters.level) params.set('level', filters.level)
      if (filters.event_type) params.set('event_type', filters.event_type)
      if (filters.user_id) params.set('user_id', filters.user_id)
      if (filters.start_time) params.set('start_time', filters.start_time)
      if (filters.end_time) params.set('end_time', filters.end_time)
      if (filters.log_file) params.set('log_file', filters.log_file)
      
      const response = await api.get<LogsResponse>(`/admin/logs?${params}`)
      return response.data
    },
    refetchInterval: refetchInterval || false, // Default: no auto-refresh
  })
}

export const useLogStats = (hours: number = 24, refetchInterval?: number) => {
  return useQuery({
    queryKey: logsKeys.stats(hours),
    queryFn: async () => {
      const response = await api.get<LogStats>(`/admin/logs/stats?hours=${hours}`)
      return response.data
    },
    refetchInterval: refetchInterval || false, // Default: no auto-refresh
  })
}

export const useLogFiles = () => {
  return useQuery({
    queryKey: logsKeys.files(),
    queryFn: async () => {
      const response = await api.get<LogFilesResponse>('/admin/logs/files')
      return response.data
    },
    staleTime: 30000, // Cache for 30 seconds
  })
}
import axios from 'axios'
import { authManager } from '@/utils/auth'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
})

// Request interceptor to add auth token
instance.interceptors.request.use(
  (config) => {
    const token = authManager.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// No axios interceptors needed - TanStack Query handles errors

export default instance
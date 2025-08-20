import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { authManager } from '@/utils/auth'
import { tokenManager } from '@/lib/token'

// Create the client instance once and export it.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error: any) => {
        if (error?.response?.status === 401) {
          authManager.clearAuth()
          tokenManager.clearToken()
          // TanStack Router's beforeLoad will handle redirect
        }
      },
    },
    mutations: {
      onError: (error: any) => {
        if (error?.response?.status === 401) {
          authManager.clearAuth()
          tokenManager.clearToken()
          // TanStack Router's beforeLoad will handle redirect
        }
      },
    },
  },
})

// getContext is no longer needed for client creation but might be used by the router.
export function getContext() {
  return {
    queryClient,
    auth: {
      isAuthenticated: authManager.isAuthenticated(),
      permissions: authManager.getUser()?.permissions || []
    }
  }
}

// The provider now uses the singleton client instance internally.
export function Provider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from '../components/Header'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'

import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'
import EmailVerificationBanner from '../components/EmailVerificationBanner'

import type { QueryClient } from '@tanstack/react-query'

interface AuthContextInfo {
  isAuthenticated: boolean
  permissions: string[]
}

interface MyRouterContext {
  queryClient: QueryClient
  auth: AuthContextInfo
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <AuthProvider>
      <div className="h-full flex flex-col">
        <Header />
        <EmailVerificationBanner />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
        <Toaster />
        <TanStackRouterDevtools />
        <TanStackQueryLayout />
      </div>
    </AuthProvider>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
      <div className="max-w-md mx-auto text-center p-6">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  ),
})

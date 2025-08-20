import { createFileRoute, Outlet, Link, useLocation } from '@tanstack/react-router'
import { requireRole } from '@/utils/routeProtection'
import { cn } from '@/lib/utils'
import { 
  Users, 
  Home,
  Menu,
  X,
  Megaphone,
  Key
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/admin')({
  beforeLoad: requireRole('admin'),
  component: AdminLayout,
})

function AdminLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Key Pool', href: '/admin/keypool', icon: Key },
    { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  ]
  
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-16 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white dark:bg-gray-800 shadow-md"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Sidebar - Desktop: relative, Mobile: fixed */}
      <div className={cn(
        "w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
        "lg:block lg:relative lg:flex-shrink-0 lg:h-full",
        "fixed inset-y-0 left-0 z-40 transform transition-transform lg:transform-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-screen lg:h-full overflow-y-auto">
          <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>
          
          <nav className="space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                             (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1">
        <main className="p-4 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
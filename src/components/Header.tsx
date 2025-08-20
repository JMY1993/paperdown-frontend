import { Link } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'
import { useLogout } from '@/services/auth'
import { Button } from '@/components/ui/button'

export default function Header() {
  const { user, isAuthenticated } = useAuth()
  const logoutMutation = useLogout()

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between border-b">
      <nav className="flex flex-row items-center overflow-x-auto">
        <div className="px-2 font-bold whitespace-nowrap">
          <Link to="/">Home</Link>
        </div>

        {isAuthenticated && (
          <div className="px-2 font-bold whitespace-nowrap">
            <Link to="/dashboard">Dashboard</Link>
          </div>
        )}
      </nav>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isAuthenticated ? (
          <>
            <span className="text-sm hidden sm:inline truncate max-w-[150px]" title={user?.email}>{user?.email}</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <span className="hidden sm:inline">
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </span>
              <span className="sm:hidden">Out</span>
            </Button>
          </>
        ) : (
          <>
            <Link to="/auth/login">
              <Button size="sm" variant="outline">Login</Button>
            </Link>
            <Link to="/auth/register" className="hidden sm:inline-block">
              <Button size="sm">Register</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

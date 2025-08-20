import { createFileRoute, Link } from '@tanstack/react-router'
import { requireAuth } from '@/utils/routeProtection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Key, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
  beforeLoad: requireAuth,
})

function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/license/licenses" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                My Licenses
              </CardTitle>
              <CardDescription>
                View your active service licenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-primary">
                <span>View Licenses</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/license/activate" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Activate Service
              </CardTitle>
              <CardDescription>
                Activate a service with an activation code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-primary">
                <span>Activate</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/license/create-and-activate" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Create Account
              </CardTitle>
              <CardDescription>
                Create account and activate service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-primary">
                <span>Create & Activate</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
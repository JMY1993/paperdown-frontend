import { createFileRoute, Link } from '@tanstack/react-router'
import { requireAuth } from '@/utils/routeProtection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Key, FileText, CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/license/')({
  component: LicenseDashboard,
  beforeLoad: requireAuth,
})

function LicenseDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">License Management</h1>
      <p className="text-muted-foreground mb-8">
        Manage your service licenses and activation codes
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/license/activate" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Activate Service
              </CardTitle>
              <CardDescription>
                Use an activation code to activate a service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-primary">
                <span>Go to Activation</span>
                <CheckCircle className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/license/create-and-activate" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Create & Activate
              </CardTitle>
              <CardDescription>
                Create a new account and activate a service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-primary">
                <span>Create Account</span>
                <CheckCircle className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/license/licenses" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Licenses
              </CardTitle>
              <CardDescription>
                View your active service licenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-primary">
                <span>View Licenses</span>
                <CheckCircle className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/license/security-test" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Test
              </CardTitle>
              <CardDescription>
                Test challenge transformation security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-primary">
                <span>Run Test</span>
                <CheckCircle className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
import { createFileRoute, Link } from '@tanstack/react-router'
import { requireRole } from '@/utils/routeProtection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BadgePlus, List, FileText } from 'lucide-react'

export const Route = createFileRoute('/admin/license/')({
  component: LicenseDashboard,
  beforeLoad: requireRole('admin'),
})

function LicenseDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">License Management</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/admin/license/activation-codes" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Activation Codes
              </CardTitle>
              <CardDescription>
                View and manage all activation codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                List, search, and filter activation codes
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/admin/license/activation-codes/create" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgePlus className="h-5 w-5" />
                Create Activation Code
              </CardTitle>
              <CardDescription>
                Generate new activation codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Create activation codes for services
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
                View your service licenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Check your active service licenses
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
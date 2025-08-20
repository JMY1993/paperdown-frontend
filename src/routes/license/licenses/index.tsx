import { createFileRoute } from '@tanstack/react-router'
import { useUserLicenses } from '@/services/license'
import { requireAuth } from '@/utils/routeProtection'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export const Route = createFileRoute('/license/licenses/')({
  component: UserLicensesPage,
  beforeLoad: requireAuth,
})

function UserLicensesPage() {
  const { data, isLoading, error } = useUserLicenses()
  
  // Calculate days remaining for a license
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }
  
  return (
    <div className="container mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Licenses</h1>
        <p className="text-muted-foreground mt-2">View your active service licenses</p>
      </div>
      
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load licenses</AlertDescription>
          </Alert>
        ) : data && data.length > 0 ? (
          data.map((license) => {
            const daysRemaining = getDaysRemaining(license.service_end_time)
            const isExpired = daysRemaining < 0
            
            return (
              <div 
                key={license.id} 
                className={`bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-3 hover:shadow-md transition-shadow ${
                  isExpired ? 'border-red-200 dark:border-red-900' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{license.service_name}</div>
                    <div className="text-xs text-muted-foreground">
                      <Calendar className="inline mr-1 h-3 w-3" />
                      {formatDate(license.service_start_time)} - {formatDate(license.service_end_time)}
                    </div>
                  </div>
                  <Badge 
                    variant={isExpired ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {isExpired ? 'Expired' : `${daysRemaining} days left`}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {license.service_duration} days total
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {license.activation_type === 'immediate' ? 'Immediate start' : 'Fixed start date'}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No licenses found</h3>
              <p className="mt-1 text-sm">
                You don't have any active licenses yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
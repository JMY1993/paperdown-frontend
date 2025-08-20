import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useActivateService } from '@/services/license'
import { requireAuth } from '@/utils/routeProtection'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react'

export const Route = createFileRoute('/license/activate')({
  component: ActivateServicePage,
  beforeLoad: requireAuth,
})

function ActivateServicePage() {
  const [activationCode, setActivationCode] = useState('')
  const activateMutation = useActivateService()
  const { toast } = useToast()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!activationCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an activation code",
      })
      return
    }
    
    try {
      await activateMutation.mutateAsync(activationCode)
      toast({
        title: "Success",
        description: "Service activated successfully!",
      })
    } catch (error: any) {
      console.error('Activation error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to activate service'
      toast({
        variant: "destructive",
        title: "Activation Failed",
        description: errorMessage,
      })
    }
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Activate Service</CardTitle>
            <CardDescription>
              Enter your activation code to activate a service
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activation-code">Activation Code</Label>
                <Input
                  id="activation-code"
                  placeholder="Enter your activation code"
                  value={activationCode}
                  onChange={(e) => setActivationCode(e.target.value)}
                  disabled={activateMutation.isPending}
                />
              </div>
              
              {activateMutation.isSuccess && (
                <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Service activated successfully! You can now use the service.
                  </AlertDescription>
                </Alert>
              )}
              
              {activateMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {(activateMutation.error as any).response?.data?.error || 'Failed to activate service'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={activateMutation.isPending || !activationCode.trim()}
              >
                {activateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  'Activate Service'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
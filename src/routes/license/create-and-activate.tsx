import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useCreateAndActivateUser } from '@/services/license'
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

export const Route = createFileRoute('/license/create-and-activate')({
  component: CreateAndActivateUserPage,
})

function CreateAndActivateUserPage() {
  const [formData, setFormData] = useState({
    code: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const createAndActivateMutation = useCreateAndActivateUser()
  const { toast } = useToast()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an activation code",
      })
      return
    }
    
    if (!formData.email.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email",
      })
      return
    }
    
    if (!formData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a password",
      })
      return
    }
    
    if (formData.password.length < 8) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 8 characters long",
      })
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      })
      return
    }
    
    try {
      await createAndActivateMutation.mutateAsync({
        code: formData.code,
        email: formData.email,
        password: formData.password
      })
      toast({
        title: "Success",
        description: "Account created and service activated successfully!",
      })
    } catch (error: any) {
      console.error('Create and activate error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create account and activate service'
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
            <CardTitle>Create Account & Activate Service</CardTitle>
            <CardDescription>
              Enter your activation code and account details to create an account and activate a service
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activation-code">Activation Code</Label>
                <Input
                  id="activation-code"
                  placeholder="Enter your activation code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  disabled={createAndActivateMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={createAndActivateMutation.isPending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={createAndActivateMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  disabled={createAndActivateMutation.isPending}
                />
              </div>
              
              {createAndActivateMutation.isSuccess && (
                <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Account created and service activated successfully! You can now log in with your credentials.
                  </AlertDescription>
                </Alert>
              )}
              
              {createAndActivateMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {(createAndActivateMutation.error as any).response?.data?.error || 'Failed to create account and activate service'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={createAndActivateMutation.isPending}
              >
                {createAndActivateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Create Account & Activate Service'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
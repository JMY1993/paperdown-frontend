import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, Mail, CheckCircle, Send } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/auth/verify-email')({
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [cooldown, setCooldown] = useState(0) // Cooldown in seconds
  
  // Mutation for sending verification email
  const sendVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/send-verification')
      return response.data
    },
    onSuccess: () => {
      setSuccessMessage('Verification code sent to your email')
      setError('')
      // Start cooldown timer (60 seconds)
      setCooldown(60)
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.error || 'Failed to send verification email'
      setError(errorMsg)
      setSuccessMessage('')
    }
  })
  
  // Mutation for verifying email
  const verifyEmailMutation = useMutation({
    mutationFn: async (verificationCode: string) => {
      const response = await api.post('/auth/verify-email', { code: verificationCode })
      return response.data
    },
    onSuccess: (data) => {
      // Update token in local storage if provided
      if (data.token) {
        localStorage.setItem('token', data.token)
        // Reload the page to refresh the auth context
        window.location.reload()
      } else {
        // If no token, navigate to dashboard
        navigate({ to: '/dashboard' })
      }
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.error || 'Invalid or expired verification code'
      setError(errorMsg)
      setSuccessMessage('')
    }
  })
  
  // Handle cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setTimeout(() => {
        setCooldown(cooldown - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [cooldown])
  
  // Don't auto-send verification email on component mount
  useEffect(() => {
    if (user?.email_verified) {
      navigate({ to: '/dashboard' })
    }
  }, [user, navigate])
  
  const handleSendVerification = async () => {
    if (cooldown > 0) return
    try {
      await sendVerificationMutation.mutateAsync()
    } catch (err) {
      // Error is handled in onError
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!code.trim()) {
      setError('Please enter the verification code')
      return
    }
    
    try {
      await verifyEmailMutation.mutateAsync(code)
    } catch (err) {
      // Error is handled in onError
    }
  }
  
  if (user?.email_verified) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-md space-y-8 px-4">
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-6 text-center">
              <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Email Verified</CardTitle>
              <CardDescription>
                Your email has been successfully verified
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                You can now access all features of the application.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => navigate({ to: '/dashboard' })}
                className="w-full"
              >
                Continue to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Verify Your Email</h1>
          <p className="text-muted-foreground mt-2">
            Please enter the verification code sent to your email
          </p>
        </div>
        
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Verification
            </CardTitle>
            <CardDescription>
              We've sent a 6-digit code to <strong>{user?.email}</strong>
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {successMessage && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  className="h-11 text-center text-2xl tracking-widest"
                  maxLength={6}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the code we sent to your email address
                </p>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4 pt-6">
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={verifyEmailMutation.isPending || !code.trim()}
              >
                {verifyEmailMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
              
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 text-base font-medium"
                onClick={handleSendVerification}
                disabled={sendVerificationMutation.isPending || cooldown > 0}
              >
                {sendVerificationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Resend in {cooldown}s
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Verification Email
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Didn't receive the email? Check your spam folder</p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
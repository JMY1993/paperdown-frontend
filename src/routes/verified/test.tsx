import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, CheckCircle, Mail } from 'lucide-react'
import { requireEmailVerified } from '@/utils/routeProtection'

export const Route = createFileRoute('/verified/test')({
  beforeLoad: requireEmailVerified,
  component: VerifiedTestPage,
})

function VerifiedTestPage() {
  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Email Verified Area</h1>
          <p className="text-muted-foreground mt-2">
            This page is only accessible to users with verified email addresses
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600" />
                Protected Content
              </CardTitle>
              <CardDescription>
                This content is only visible to verified users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Congratulations! You have successfully accessed a page that requires email verification.
                This demonstrates that your email has been verified and you have full access to all features.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Verification Status
              </CardTitle>
              <CardDescription>
                Your account verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">Email Verified</p>
                  <p className="text-sm text-muted-foreground">Your email address has been verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
import { useAuth } from '@/contexts/AuthContext'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Mail, X, AlertCircle, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function EmailVerificationBanner() {
  const { user, isAuthenticated } = useAuth()
  const [isVisible, setIsVisible] = useState(true)
  
  // Check if user is authenticated but email is not verified
  const showBanner = isAuthenticated && user && !user.email_verified
  
  // Reset visibility when user changes
  useEffect(() => {
    setIsVisible(true)
  }, [user?.id])
  
  if (!showBanner || !isVisible) {
    return null
  }
  
  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-b border-amber-200 dark:border-amber-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Icon and message */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm sm:text-base">
                Email Verification Required
              </h3>
              <p className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm mt-0.5">
                Verify your email address <span className="font-medium">{user.email}</span> to unlock all features and ensure account security.
              </p>
            </div>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/auth/verify-email">
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-sm h-9 px-4 text-sm font-medium"
              >
                <Mail className="h-4 w-4 mr-2" />
                Verify Now
              </Button>
            </Link>
            
            <Button
              size="sm"
              variant="ghost"
              className="text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30 h-9 w-9 p-0"
              onClick={() => setIsVisible(false)}
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
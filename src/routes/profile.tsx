import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requireAuth } from '@/utils/routeProtection'
import { useAuth } from '@/contexts/AuthContext'
import { authManager } from '@/utils/auth'
import axios from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { User, Key, Shield, Calendar, Settings } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
  beforeLoad: requireAuth,
})

interface UserProfile {
  uuid: string
  email: string
  is_verified: boolean
  permissions: string[]
  created_at: string
  updated_at: string
}

interface UpdateProfileRequest {
  email?: string
  password?: string
}

// API Functions
async function fetchUserProfile(): Promise<UserProfile> {
  const { data } = await axios.get('/me')
  return data.user
}

async function updateUserProfile(updates: UpdateProfileRequest): Promise<UserProfile> {
  const { data } = await axios.patch('/me', updates)
  return data
}

function ProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: fetchUserProfile,
  })

  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'profile'], data)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      setIsEditing(false)
      setFormData({ email: '', password: '', confirmPassword: '' })
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.response?.data?.error || 'Failed to update profile',
      })
    },
  })

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      email: profile?.email || '',
      password: '',
      confirmPassword: ''
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({ email: '', password: '', confirmPassword: '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password mismatch",
        description: "Passwords do not match",
      })
      return
    }

    const updates: UpdateProfileRequest = {}
    
    if (formData.email !== profile?.email) {
      updates.email = formData.email
    }
    
    if (formData.password) {
      updates.password = formData.password
    }

    if (Object.keys(updates).length === 0) {
      toast({
        title: "No changes",
        description: "No changes to save",
      })
      return
    }

    updateMutation.mutate(updates)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isAdmin = authManager.isAdmin()
  const userFromToken = authManager.getUser()

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message || 'Failed to load profile'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          User Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEditing ? (
              <>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm">{profile.email}</p>
                    {profile.is_verified ? (
                      <Badge variant="default" className="text-xs">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">User ID</Label>
                  <p className="text-sm font-mono text-gray-600 break-all">{profile.uuid}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Account Created</Label>
                  <p className="text-sm text-gray-600">{formatDate(profile.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                  <p className="text-sm text-gray-600">{formatDate(profile.updated_at)}</p>
                </div>
                <Button onClick={handleEdit} className="w-full mt-4">
                  Edit Profile
                </Button>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">New Password (optional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Leave empty to keep current password"
                  />
                </div>
                {formData.password && (
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  >
                    {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Permissions and Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions & Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Permissions</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {userFromToken?.permissions && userFromToken.permissions.length > 0 ? (
                    userFromToken.permissions.map((permission, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No special permissions</p>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Debug: isAdmin = {String(isAdmin)}, permissions = {JSON.stringify(userFromToken?.permissions)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  {profile.is_verified ? (
                    <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Email Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Email Verification Required
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              onClick={() => navigate({ to: '/license/licenses' })}
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              My Licenses
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate({ to: '/license/activate' })}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Activate Service
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate({ to: '/dashboard' })}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Dashboard
            </Button>
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => navigate({ to: '/admin' })}
                className="flex items-center gap-2 md:col-span-3 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/30"
              >
                <Settings className="h-4 w-4" />
                Admin Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
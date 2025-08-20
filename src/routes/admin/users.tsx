import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useUsers, useDeleteUser, useUpdateUser, useCreateUser, useSetUserPermissions } from '@/services/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { 
  Trash2, 
  Edit, 
  UserPlus,
  Search,
  AlertCircle,
  X,
  Plus,
  Loader2
} from 'lucide-react'

export const Route = createFileRoute('/admin/users')({
  component: UsersPage,
})

interface User {
  id: string
  email: string
  username: string | null
  created_at: string
  permissions: string[]
}

function UsersPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [creatingUser, setCreatingUser] = useState(false)
  
  // Permission editing states
  const [editingPermissions, setEditingPermissions] = useState<string | null>(null)
  const [permissionInputs, setPermissionInputs] = useState<Record<string, string>>({})
  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>({})
  
  const { data, isLoading, error } = useUsers(page, 20)
  const deleteUserMutation = useDeleteUser()
  const updateUserMutation = useUpdateUser()
  const createUserMutation = useCreateUser()
  const setPermissionsMutation = useSetUserPermissions()
  const { toast } = useToast()
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    username: '',
    permissions: [] as string[]
  })
  
  const [editForm, setEditForm] = useState({
    email: '',
    username: '',
    password: ''
  })
  
  // Initialize user permissions when data loads
  useEffect(() => {
    if (data?.users) {
      const perms: Record<string, string[]> = {}
      data.users.forEach(user => {
        perms[user.id] = user.permissions || []
      })
      setUserPermissions(perms)
    }
  }, [data])
  
  const handleCreateUser = async () => {
    try {
      await createUserMutation.mutateAsync(newUser)
      setCreatingUser(false)
      setNewUser({ email: '', password: '', username: '', permissions: [] })
      toast({
        title: "Success",
        description: "User created successfully",
      })
    } catch (error: any) {
      console.error('Create user error:', error)
      toast({
        variant: "destructive",
        title: "Error creating user",
        description: error.response?.data?.error || 'Failed to create user',
      })
    }
  }
  
  const handleUpdateUser = async () => {
    if (!editingUser) return
    
    const updates: any = {}
    if (editForm.email !== editingUser.email) updates.email = editForm.email
    if (editForm.username !== editingUser.username) updates.username = editForm.username
    if (editForm.password) updates.password = editForm.password
    
    try {
      await updateUserMutation.mutateAsync({ 
        userId: editingUser.id, 
        data: updates 
      })
      setEditingUser(null)
    } catch (error) {
      // Handle error
    }
  }
  
  const handleDeleteUser = async () => {
    if (!deletingUser) return
    
    try {
      await deleteUserMutation.mutateAsync(deletingUser.id)
      setDeletingUser(null)
    } catch (error) {
      // Handle error
    }
  }
  
  const handleAddPermission = async (userId: string) => {
    const newPerm = permissionInputs[userId]?.trim()
    if (!newPerm) return
    
    const currentPerms = userPermissions[userId] || []
    if (currentPerms.includes(newPerm)) {
      setPermissionInputs({ ...permissionInputs, [userId]: '' })
      return
    }
    
    const updatedPerms = [...currentPerms, newPerm]
    
    try {
      await setPermissionsMutation.mutateAsync({
        userId,
        permissions: updatedPerms
      })
      setUserPermissions({ ...userPermissions, [userId]: updatedPerms })
      setPermissionInputs({ ...permissionInputs, [userId]: '' })
    } catch (error) {
      // Handle error
    }
  }
  
  const handleRemovePermission = async (userId: string, permission: string) => {
    const currentPerms = userPermissions[userId] || []
    const updatedPerms = currentPerms.filter(p => p !== permission)
    
    try {
      await setPermissionsMutation.mutateAsync({
        userId,
        permissions: updatedPerms
      })
      setUserPermissions({ ...userPermissions, [userId]: updatedPerms })
    } catch (error) {
      // Handle error
    }
  }
  
  const filteredUsers = data?.users?.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">Manage user accounts and their permissions</p>
      </div>
      
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="search-query"
            name="q"
            type="search"
            autoComplete="nope"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setCreatingUser(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      {/* Users Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load users</AlertDescription>
          </Alert>
        ) : (
          <>
            {filteredUsers?.map((user) => (
              <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-3 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-medium text-sm break-all">{user.email}</div>
                    {user.username && (
                      <div className="text-sm text-muted-foreground">@{user.username}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingUser(user)
                        setEditForm({
                          email: user.email,
                          username: user.username || '',
                          password: ''
                        })
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingUser(user)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Permissions:</div>
                  <div className="flex gap-1 flex-wrap items-center">
                    {(userPermissions[user.id] || []).length === 0 ? (
                      <span className="text-xs text-muted-foreground">No permissions</span>
                    ) : (
                      (userPermissions[user.id] || []).map(permission => (
                        <Badge 
                          key={permission} 
                          variant="secondary"
                          className="text-xs"
                        >
                          {permission}
                          {editingPermissions === user.id && (
                            <button
                              onClick={() => handleRemovePermission(user.id, permission)}
                              className="ml-1 hover:text-destructive"
                              disabled={setPermissionsMutation.isPending}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))
                    )}
                    {editingPermissions === user.id ? (
                      <div className="flex gap-1 items-center w-full mt-2">
                        <Input
                          placeholder="e.g., role:admin"
                          value={permissionInputs[user.id] || ''}
                          onChange={(e) => setPermissionInputs({
                            ...permissionInputs,
                            [user.id]: e.target.value
                          })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddPermission(user.id)
                            }
                          }}
                          className="h-8 text-xs flex-1"
                          disabled={setPermissionsMutation.isPending}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleAddPermission(user.id)}
                          disabled={setPermissionsMutation.isPending}
                        >
                          {setPermissionsMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingPermissions(null)
                            setPermissionInputs({})
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => setEditingPermissions(user.id)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      
      {/* Pagination */}
      {data && data.total > 20 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page > 1) setPage(p => p - 1)
                }}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {/* Show page numbers */}
            {Array.from({ length: Math.min(5, Math.ceil(data.total / 20)) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(Math.ceil(data.total / 20) - 4, page - 2)) + i
              if (pageNum > Math.ceil(data.total / 20)) return null
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(pageNum)
                    }}
                    isActive={page === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (page < Math.ceil(data.total / 20)) setPage(p => p + 1)
                }}
                className={page === Math.ceil(data.total / 20) ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      {/* Create User Dialog */}
      <Dialog open={creatingUser} onOpenChange={setCreatingUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user account to the system
            </DialogDescription>
          </DialogHeader>
          <form autoComplete="nope">
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                name="email"
                type="email"
                autoComplete="new-password"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="new-username">Username (optional)</Label>
              <Input
                id="new-username"
                name="username"
                type="text"
                autoComplete="new-password"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="Enter username (optional)"
              />
            </div>
            <div>
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div>
              <Label>Initial Permissions</Label>
              <div className="flex gap-1 flex-wrap mt-1">
                {newUser.permissions.map((perm, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {perm}
                    <button
                      onClick={() => {
                        const perms = [...newUser.permissions]
                        perms.splice(idx, 1)
                        setNewUser({ ...newUser, permissions: perms })
                      }}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Input
                  placeholder="Add permission..."
                  className="h-7 w-32 text-xs"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget
                      const value = input.value.trim()
                      if (value && !newUser.permissions.includes(value)) {
                        setNewUser({ 
                          ...newUser, 
                          permissions: [...newUser.permissions, value] 
                        })
                        input.value = ''
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatingUser(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={!newUser.email || !newUser.password || createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user account information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="edit-email"
                type="text"
                autoComplete="off"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                name="edit-username"
                autoComplete="off"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
              <Input
                id="edit-password"
                name="edit-password"
                type="password"
                autoComplete="new-password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingUser && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                User: <span className="font-medium text-foreground">{deletingUser.email}</span>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
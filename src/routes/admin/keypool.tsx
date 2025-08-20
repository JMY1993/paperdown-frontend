import { createFileRoute, Link } from '@tanstack/react-router'
import { requireRole } from '@/utils/routeProtection'
import { useState } from 'react'
import { 
  useAPIKeys, 
  useDeleteAPIKey, 
  useResetQuotas,
  type APIKey,
  type ListAPIKeysParams 
} from '@/services/keypool'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  RotateCcw,
  Key
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

export const Route = createFileRoute('/admin/keypool')({
  beforeLoad: requireRole('admin'),
  component: KeyPoolPage,
})

function KeyPoolPage() {
  const { toast } = useToast()
  const [filters, setFilters] = useState<ListAPIKeysParams>({
    page: 1,
    limit: 20
  })

  const { data, isLoading, error } = useAPIKeys(filters)
  const deleteKey = useDeleteAPIKey()
  const resetQuotas = useResetQuotas()

  const handleDelete = async (keyId: string, serviceName: string) => {
    if (!confirm(`Are you sure you want to delete the API key for ${serviceName}?`)) return
    
    try {
      await deleteKey.mutateAsync(keyId)
      toast({
        title: "Success",
        description: "API key deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      })
    }
  }

  const handleResetQuotas = async (keyId: string, serviceName: string) => {
    if (!confirm(`Reset all quotas for ${serviceName}?`)) return
    
    try {
      await resetQuotas.mutateAsync(keyId)
      toast({
        title: "Success", 
        description: "Quotas reset successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset quotas",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      disabled: 'secondary', 
      expired: 'destructive'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  const formatQuotaInfo = (quotas: any) => {
    if (!quotas?.quotas?.length) return 'No quotas'
    
    const quota = quotas.quotas[0]
    const percentage = quota.limit > 0 ? (quota.used / quota.limit * 100).toFixed(1) : 0
    
    return (
      <div className="space-y-1">
        <div className="text-sm">
          {quota.used}/{quota.limit} ({percentage}%)
        </div>
        <div className="text-xs text-gray-500">
          {quota.type === 'recurring' ? 
            `${quota.cycle_minutes || 1440}min cycle` : 
            'One-time'
          }
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load API keys</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Key Pool</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage API keys for external services
          </p>
        </div>
        <Link to="/admin/keypool/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add API Key
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by service name..."
                value={filters.service_name || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  service_name: e.target.value || undefined,
                  page: 1 
                }))}
                className="max-w-sm"
              />
            </div>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                status: value === 'all' ? undefined : value,
                page: 1 
              }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys ({data?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !data?.keys?.length ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No API keys found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Quota Usage</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.keys.map((key: APIKey) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{key.service_name}</div>
                        {key.remark && (
                          <div className="text-sm text-gray-500">{key.remark}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {key.api_key.substring(0, 10)}...
                      </code>
                    </TableCell>
                    <TableCell>{getStatusBadge(key.status)}</TableCell>
                    <TableCell>{key.priority}</TableCell>
                    <TableCell>{formatQuotaInfo(key.quotas)}</TableCell>
                    <TableCell>
                      {key.last_used_at ? 
                        new Date(key.last_used_at).toLocaleDateString() : 
                        'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/admin/keypool/$keyId/edit" params={{ keyId: key.id }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleResetQuotas(key.id, key.service_name)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset Quotas
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(key.id, key.service_name)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
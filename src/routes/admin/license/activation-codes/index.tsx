import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useActivationCodes, useDeleteActivationCode } from '@/services/license'
import { requireRole } from '@/utils/routeProtection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Plus,
  Search,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/admin/license/activation-codes/')({
  component: ActivationCodesPage,
  beforeLoad: requireRole('admin'),
})

function ActivationCodesPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingCode, setDeletingCode] = useState<string | null>(null)
  
  const { data, isLoading, error } = useActivationCodes(page, 20)
  const deleteMutation = useDeleteActivationCode()
  const { toast } = useToast()
  
  const handleDeleteCode = async (code: string) => {
    try {
      await deleteMutation.mutateAsync(code)
      toast({
        title: "Success",
        description: "Activation code deleted successfully",
      })
    } catch (error: any) {
      console.error('Delete activation code error:', error)
      toast({
        variant: "destructive",
        title: "Error deleting activation code",
        description: error.response?.data?.error || 'Failed to delete activation code',
      })
    } finally {
      setDeletingCode(null)
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activation Codes</h1>
        <p className="text-muted-foreground mt-2">Manage activation codes for services</p>
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
            placeholder="Search activation codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link to="/admin/license/activation-codes/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Activation Code
          </Button>
        </Link>
      </div>
      
      {/* Activation Codes Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Code</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>License Period</TableHead>
              <TableHead>Code Expiry</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Alert variant="destructive" className="m-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Failed to load activation codes</AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            ) : data?.activation_codes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No activation codes found
                </TableCell>
              </TableRow>
            ) : (
              data?.activation_codes?.map((code) => {
                // 计算license有效期
                const getLicensePeriod = () => {
                  if (code.service_duration <= 0) return 'Permanent'
                  const days = code.service_duration
                  if (days >= 365) {
                    const years = Math.floor(days / 365)
                    const remainingDays = days % 365
                    return years > 0 && remainingDays > 0 
                      ? `${years}y ${remainingDays}d`
                      : `${years}y`
                  }
                  if (days >= 30) {
                    const months = Math.floor(days / 30)
                    const remainingDays = days % 30
                    return months > 0 && remainingDays > 0
                      ? `${months}m ${remainingDays}d`
                      : `${months}m`
                  }
                  return `${days}d`
                }

                // 判断code过期状态
                const isCodeExpired = code.code_ttl ? new Date(code.code_ttl) < new Date() : false
                const isCodeExhausted = code.max_uses ? code.used_count >= code.max_uses : false

                return (
                  <TableRow key={code.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      <div className="max-w-[200px] truncate" title={code.code}>
                        {code.code}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="secondary">{code.service_name}</Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {code.bind_type}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {code.activation_type}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{getLicensePeriod()}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {code.code_ttl ? (
                        <div className={`flex items-center gap-1 text-sm ${
                          isCodeExpired ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(code.code_ttl).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No expiry</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <span className={code.used_count > 0 ? 'font-medium' : ''}>
                          {code.used_count}
                        </span>
                        {code.max_uses ? (
                          <span className="text-muted-foreground"> / {code.max_uses}</span>
                        ) : (
                          <span className="text-muted-foreground"> / ∞</span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {isCodeExpired ? (
                          <Badge variant="destructive" className="text-xs w-fit">
                            Expired
                          </Badge>
                        ) : isCodeExhausted ? (
                          <Badge variant="destructive" className="text-xs w-fit">
                            Exhausted
                          </Badge>
                        ) : code.used_count > 0 ? (
                          <Badge variant="default" className="text-xs w-fit">
                            Used
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs w-fit">
                            Available
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to="/admin/license/activation-codes/$codeId/edit" params={{ codeId: code.code }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => setDeletingCode(code.code)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
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
      
      {/* Delete Confirmation Dialog */}
      {deletingCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Delete Activation Code</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this activation code? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeletingCode(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteCode(deletingCode)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
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
} from 'lucide-react'

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
      
      {/* Activation Codes Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load activation codes</AlertDescription>
          </Alert>
        ) : (
          <>
            {data?.activation_codes?.map((code) => (
              <div key={code.id} className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-3 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-medium text-sm break-all">{code.code}</div>
                    <div className="text-sm text-muted-foreground">{code.service_name}</div>
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(code.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link to="/admin/license/activation-codes/$codeId/edit" params={{ codeId: code.code }}>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingCode(code.code)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {code.bind_type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {code.stacking_type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {code.activation_type}
                    </Badge>
                    
                    {/* Usage Status Badge */}
                    {code.max_uses ? (
                      code.used_count >= code.max_uses ? (
                        <Badge variant="destructive" className="text-xs">
                          Exhausted
                        </Badge>
                      ) : code.used_count > 0 ? (
                        <Badge variant="default" className="text-xs">
                          Partially Used
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Unused
                        </Badge>
                      )
                    ) : (
                      code.used_count > 0 ? (
                        <Badge variant="default" className="text-xs">
                          Used {code.used_count}x
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Unused
                        </Badge>
                      )
                    )}
                  </div>
                  
                  {code.code_ttl && (
                    <div className="text-xs text-muted-foreground">
                      Expires: {new Date(code.code_ttl).toLocaleDateString()}
                    </div>
                  )}
                  
                  {/* Always show usage information */}
                  <div className="text-xs text-muted-foreground">
                    Used: {code.used_count}{code.max_uses ? ` / ${code.max_uses}` : ' (unlimited)'}
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
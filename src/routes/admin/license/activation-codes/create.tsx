import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCreateActivationCode } from '@/services/license'
import { requireRole } from '@/utils/routeProtection'
import { useToast } from '@/hooks/use-toast'
import { ActivationCodeForm } from '@/components/license/ActivationCodeForm'
import type { ActivationCodeFormValues } from '@/components/license/ActivationCodeForm'

export const Route = createFileRoute('/admin/license/activation-codes/create')({
  component: CreateActivationCodePage,
  beforeLoad: requireRole('admin'),
})

function CreateActivationCodePage() {
  const navigate = useNavigate()
  const createMutation = useCreateActivationCode()
  const { toast } = useToast()
  
  const handleSubmit = async (data: ActivationCodeFormValues) => {
    try {
      // Transform the data to match the API requirements
      const apiData = {
        ...data,
        code_ttl: data.code_ttl || undefined,
        service_start_time: data.service_start_time || undefined,
        user_uuid: data.user_uuid || undefined,
      }
      
      await createMutation.mutateAsync(apiData)
      toast({
        title: "Success",
        description: "Activation code created successfully",
      })
      navigate({ to: '/admin/license/activation-codes' })
    } catch (error: any) {
      console.error('Create activation code error:', error)
      toast({
        variant: "destructive",
        title: "Error creating activation code",
        description: error.response?.data?.error || 'Failed to create activation code',
      })
    }
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create Activation Code</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <ActivationCodeForm
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: '/admin/license/activation-codes' })}
            submitText="Create Activation Code"
            isSubmitting={createMutation.isPending}
          />
        </div>
      </div>
    </div>
  )
}
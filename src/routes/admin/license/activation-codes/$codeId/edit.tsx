import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useActivationCode, useUpdateActivationCode } from '@/services/license'
import { requireRole } from '@/utils/routeProtection'
import { useToast } from '@/hooks/use-toast'
import { ActivationCodeForm, type ActivationCodeFormValues } from '@/components/license/ActivationCodeForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/admin/license/activation-codes/$codeId/edit')({
  component: EditActivationCodePage,
  beforeLoad: requireRole('admin'),
})

function EditActivationCodePage() {
  const { codeId } = Route.useParams()
  const navigate = useNavigate()
  const updateMutation = useUpdateActivationCode()
  const { toast } = useToast()
  const { data, isLoading, error } = useActivationCode(codeId)
  
  const handleSubmit = async (formData: ActivationCodeFormValues) => {
    try {
      await updateMutation.mutateAsync({ code: codeId, data: formData })
      toast({
        title: "Success",
        description: "Activation code updated successfully",
      })
      navigate({ to: '/admin/license/activation-codes' })
    } catch (error: any) {
      console.error('Update activation code error:', error)
      toast({
        variant: "destructive",
        title: "Error updating activation code",
        description: error.response?.data?.error || 'Failed to update activation code',
      })
    }
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Edit Activation Code</h1>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Edit Activation Code</h1>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || 'Failed to load activation code'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }
  
  // Transform the data to match the form structure
  const initialData = {
    service_name: data.service_name,
    code_ttl: data.code_ttl,
    activation_type: data.activation_type as "immediate" | "fixed",
    service_start_time: data.service_start_time,
    service_duration: data.service_duration,
    bind_type: data.bind_type as "user" | "universal",
    stacking_type: data.stacking_type as "reject" | "extend" | "replace",
    user_uuid: data.user_uuid,
    max_uses: data.max_uses,
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Activation Code</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <ActivationCodeForm
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: '/admin/license/activation-codes' })}
            initialData={initialData}
            submitText="Update Activation Code"
            isSubmitting={updateMutation.isPending}
          />
        </div>
      </div>
    </div>
  )
}
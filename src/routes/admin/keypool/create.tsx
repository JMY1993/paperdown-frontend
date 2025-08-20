import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { requireRole } from '@/utils/routeProtection'
import { useState } from 'react'
import { useCreateAPIKey, type CreateAPIKeyRequest, type QuotaRule } from '@/services/keypool'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export const Route = createFileRoute('/admin/keypool/create')({
  beforeLoad: requireRole('admin'),
  component: CreateAPIKeyPage,
})

function CreateAPIKeyPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createKey = useCreateAPIKey()

  const [formData, setFormData] = useState<CreateAPIKeyRequest>({
    service_name: '',
    api_key: '',
    api_url: '',
    remark: '',
    priority: 0,
    cost_per_use: 0,
    tags: [],
    quotas: {
      quotas: [{
        type: 'recurring',
        limit: 100,
        used: 0,
        cycle_minutes: 1440 // 24小时
      }]
    }
  })

  const [tagsInput, setTagsInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 处理tags
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean)
    
    try {
      await createKey.mutateAsync({
        ...formData,
        tags: tags.length > 0 ? tags : undefined
      })
      
      toast({
        title: "Success",
        description: "API key created successfully",
      })
      
      navigate({ to: '/admin/keypool' })
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to create API key",
        variant: "destructive"
      })
    }
  }

  const addQuotaRule = () => {
    setFormData(prev => ({
      ...prev,
      quotas: {
        quotas: [...prev.quotas.quotas, {
          type: 'recurring',
          limit: 100,
          used: 0,
          cycle_minutes: 1440
        }]
      }
    }))
  }

  const removeQuotaRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quotas: {
        quotas: prev.quotas.quotas.filter((_, i) => i !== index)
      }
    }))
  }

  const updateQuotaRule = (index: number, field: keyof QuotaRule, value: any) => {
    setFormData(prev => ({
      ...prev,
      quotas: {
        quotas: prev.quotas.quotas.map((quota, i) => 
          i === index ? { ...quota, [field]: value } : quota
        )
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/keypool">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create API Key</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add a new API key to the pool
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_name">Service Name *</Label>
                <Input
                  id="service_name"
                  value={formData.service_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
                  placeholder="e.g., ocr, translation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key">API Key *</Label>
              <Input
                id="api_key"
                value={formData.api_key}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                placeholder="Enter the API key"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_url">API URL</Label>
              <Input
                id="api_url"
                value={formData.api_url}
                onChange={(e) => setFormData(prev => ({ ...prev, api_url: e.target.value }))}
                placeholder="https://api.example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_per_use">Cost Per Use</Label>
                <Input
                  id="cost_per_use"
                  type="number"
                  step="0.0001"
                  value={formData.cost_per_use}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost_per_use: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="premium, fast, experimental"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remark">Remark</Label>
              <Textarea
                id="remark"
                value={formData.remark}
                onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                placeholder="Optional description or notes"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quota Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quota Configuration</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addQuotaRule}>
                <Plus className="mr-2 h-4 w-4" />
                Add Quota
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.quotas.quotas.map((quota, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Quota Rule #{index + 1}</h4>
                  {formData.quotas.quotas.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuotaRule(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={quota.type}
                      onValueChange={(value) => updateQuotaRule(index, 'type', value as 'one_time' | 'recurring')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">One Time</SelectItem>
                        <SelectItem value="recurring">Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Limit</Label>
                    <Input
                      type="number"
                      value={quota.limit}
                      onChange={(e) => updateQuotaRule(index, 'limit', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>

                  {quota.type === 'recurring' && (
                    <div className="space-y-2">
                      <Label>Cycle (minutes)</Label>
                      <Input
                        type="number"
                        value={quota.cycle_minutes || 1440}
                        onChange={(e) => updateQuotaRule(index, 'cycle_minutes', parseInt(e.target.value) || 1440)}
                        min="1"
                      />
                    </div>
                  )}

                  {quota.type === 'one_time' && (
                    <div className="space-y-2">
                      <Label>Expires At</Label>
                      <Input
                        type="datetime-local"
                        value={quota.expires_at || ''}
                        onChange={(e) => updateQuotaRule(index, 'expires_at', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={createKey.isPending}>
            {createKey.isPending ? 'Creating...' : 'Create API Key'}
          </Button>
          <Link to="/admin/keypool">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
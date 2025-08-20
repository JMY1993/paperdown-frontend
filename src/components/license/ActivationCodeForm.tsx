import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const activationCodeSchema = z.object({
  service_name: z.string().min(1, "Service name is required").max(100, "Service name must be less than 100 characters"),
  code_ttl: z.string().optional(),
  activation_type: z.enum(["immediate", "fixed"]),
  service_start_time: z.string().optional(),
  service_duration: z.number().int().positive("Service duration must be a positive number"),
  bind_type: z.enum(["user", "universal"]),
  stacking_type: z.enum(["reject", "extend", "replace"]),
  user_uuid: z.string().uuid().optional(),
  max_uses: z.number().int().positive("Max uses must be a positive number").optional(),
})

export type ActivationCodeFormValues = z.infer<typeof activationCodeSchema>

interface ActivationCodeFormProps {
  onSubmit: (data: ActivationCodeFormValues) => void
  onCancel?: () => void
  initialData?: Partial<ActivationCodeFormValues>
  submitText?: string
  isSubmitting?: boolean
}

export function ActivationCodeForm({ 
  onSubmit, 
  onCancel, 
  initialData,
  submitText = "Submit",
  isSubmitting = false
}: ActivationCodeFormProps) {
  const [showUserField, setShowUserField] = useState(!!initialData?.user_uuid)
  const [showStartTimeField, setShowStartTimeField] = useState(initialData?.activation_type === "fixed")
  
  const form = useForm<ActivationCodeFormValues>({
    resolver: zodResolver(activationCodeSchema),
    defaultValues: {
      service_name: initialData?.service_name || "",
      code_ttl: initialData?.code_ttl || (() => {
        // Default to 3 days from now
        const date = new Date()
        date.setDate(date.getDate() + 3)
        return date.toISOString().slice(0, 16) // Format for datetime-local
      })(),
      activation_type: initialData?.activation_type || "immediate",
      service_start_time: initialData?.service_start_time || undefined,
      service_duration: initialData?.service_duration || 30,
      bind_type: initialData?.bind_type || "universal",
      stacking_type: initialData?.stacking_type || "extend",
      user_uuid: initialData?.user_uuid || undefined,
      max_uses: initialData?.max_uses || 1,
    },
  })
  
  const bindType = form.watch("bind_type")
  const activationType = form.watch("activation_type")
  
  // Update conditional fields visibility
  if (bindType === "user" && !showUserField) {
    setShowUserField(true)
  } else if (bindType === "universal" && showUserField) {
    setShowUserField(false)
    form.setValue("user_uuid", undefined)
  }
  
  if (activationType === "fixed" && !showStartTimeField) {
    setShowStartTimeField(true)
  } else if (activationType === "immediate" && showStartTimeField) {
    setShowStartTimeField(false)
    form.setValue("service_start_time", undefined)
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="service_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter service name" {...field} />
              </FormControl>
              <FormDescription>
                The name of the service this activation code is for
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="activation_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activation Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activation type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="fixed">Fixed Date</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  When the service period starts
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="service_duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Duration (Days)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter duration in days" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  How long the service will be active
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {showStartTimeField && (
          <FormField
            control={form.control}
            name="service_start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Start Time</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  When the service period will start
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="bind_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Binding Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select binding type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="universal">Universal</SelectItem>
                    <SelectItem value="user">User-specific</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Whether this code is for a specific user or universal
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="stacking_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stacking Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stacking type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="reject">Reject</SelectItem>
                    <SelectItem value="extend">Extend</SelectItem>
                    <SelectItem value="replace">Replace</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How to handle existing licenses
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="max_uses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Uses (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter maximum uses (default: 1)" 
                    {...field} 
                    onChange={e => {
                      const value = e.target.value
                      field.onChange(value === "" ? undefined : parseInt(value) || 0)
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Maximum number of times this code can be used (default: 1 use only)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {showUserField && (
            <FormField
              control={form.control}
              name="user_uuid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User UUID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter user UUID" {...field} />
                  </FormControl>
                  <FormDescription>
                    The UUID of the user this code is bound to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <FormField
          control={form.control}
          name="code_ttl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code Expiration Time</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                When this activation code will expire (default: 3 days from now)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitText}
          </Button>
        </div>
      </form>
    </Form>
  )
}
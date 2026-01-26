import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { equipmentMaintenanceSchema, type EquipmentMaintenanceFormData } from '@/lib/validations';
import { MAINTENANCE_TYPE_LABELS, type MaintenanceType } from '@/types/inventory';
import { Loader2 } from 'lucide-react';

interface MaintenanceFormProps {
  equipmentId: string;
  defaultValues?: Partial<EquipmentMaintenanceFormData>;
  onSubmit: (data: EquipmentMaintenanceFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const MaintenanceForm = ({
  equipmentId,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: MaintenanceFormProps) => {
  const form = useForm<EquipmentMaintenanceFormData>({
    resolver: zodResolver(equipmentMaintenanceSchema),
    defaultValues: {
      equipment_id: equipmentId,
      maintenance_type: defaultValues?.maintenance_type || 'inspection',
      next_scheduled_date: defaultValues?.next_scheduled_date || '',
      notes: defaultValues?.notes || '',
      cost: defaultValues?.cost || null,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Maintenance Type"
        htmlFor="maintenance_type"
        error={form.formState.errors.maintenance_type?.message}
        required
      >
        <Controller
          name="maintenance_type"
          control={form.control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="maintenance_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['inspection', 'repair', 'replacement'] as MaintenanceType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {MAINTENANCE_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Next Scheduled Date"
          htmlFor="next_scheduled_date"
          error={form.formState.errors.next_scheduled_date?.message}
        >
          <Input
            id="next_scheduled_date"
            type="date"
            {...form.register('next_scheduled_date')}
          />
        </FormField>

        <FormField
          label="Cost"
          htmlFor="cost"
          error={form.formState.errors.cost?.message}
        >
          <Input
            id="cost"
            type="number"
            step="0.01"
            min="0"
            {...form.register('cost', {
              valueAsNumber: true,
              setValueAs: (v) => (v === '' ? null : v),
            })}
          />
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes" error={form.formState.errors.notes?.message}>
        <Textarea id="notes" {...form.register('notes')} rows={4} />
      </FormField>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </div>
    </form>
  );
};

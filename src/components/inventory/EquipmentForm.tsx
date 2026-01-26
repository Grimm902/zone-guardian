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
import { equipmentItemSchema, type EquipmentItemFormData } from '@/lib/validations';
import { useCategories } from '@/hooks/queries/useInventory';
import { useLocations } from '@/hooks/queries/useInventory';
import { CONDITION_LABELS, type EquipmentCondition } from '@/types/inventory';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface EquipmentFormProps {
  defaultValues?: Partial<EquipmentItemFormData>;
  onSubmit: (data: EquipmentItemFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const EquipmentForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: EquipmentFormProps) => {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: locations } = useLocations();

  const form = useForm<EquipmentItemFormData>({
    resolver: zodResolver(equipmentItemSchema),
    defaultValues: {
      category_id: defaultValues?.category_id || '',
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      code: defaultValues?.code || '',
      quantity_total: defaultValues?.quantity_total || 0,
      unit_cost: defaultValues?.unit_cost || null,
      condition: defaultValues?.condition || 'good',
      location_id: defaultValues?.location_id || null,
      image_url: defaultValues?.image_url || '',
      notes: defaultValues?.notes || '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Category"
          htmlFor="category_id"
          error={form.formState.errors.category_id?.message}
          required
        >
          <Controller
            name="category_id"
            control={form.control}
            render={({ field }) => (
              <>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={categoriesLoading || !categories || categories.length === 0}
                >
                  <SelectTrigger id="category_id">
                    <SelectValue
                      placeholder={
                        categoriesLoading
                          ? 'Loading categories...'
                          : !categories || categories.length === 0
                            ? 'No categories available'
                            : 'Select category'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading...</div>
                    ) : categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No categories available
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {!categoriesLoading && (!categories || categories.length === 0) && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No categories found. Please{' '}
                      <Link
                        to="/app/inventory/categories"
                        className="underline font-medium hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Close the current dialog if it exists
                          if (onCancel) {
                            onCancel();
                          }
                        }}
                      >
                        create a category
                      </Link>{' '}
                      first.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          />
        </FormField>

        <FormField label="Name" htmlFor="name" error={form.formState.errors.name?.message} required>
          <Input id="name" {...form.register('name')} />
        </FormField>
      </div>

      <FormField
        label="Description"
        htmlFor="description"
        error={form.formState.errors.description?.message}
      >
        <Textarea id="description" {...form.register('description')} rows={3} />
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Code" htmlFor="code" error={form.formState.errors.code?.message}>
          <Input id="code" placeholder="TC-12345 (optional)" {...form.register('code')} />
        </FormField>

        <FormField
          label="Condition"
          htmlFor="condition"
          error={form.formState.errors.condition?.message}
          required
        >
          <Controller
            name="condition"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    ['good', 'fair', 'damaged', 'needs_repair', 'retired'] as EquipmentCondition[]
                  ).map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {CONDITION_LABELS[condition]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Total Quantity"
          htmlFor="quantity_total"
          error={form.formState.errors.quantity_total?.message}
          required
        >
          <Input
            id="quantity_total"
            type="number"
            min="0"
            {...form.register('quantity_total', { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label="Unit Cost"
          htmlFor="unit_cost"
          error={form.formState.errors.unit_cost?.message}
        >
          <Input
            id="unit_cost"
            type="number"
            step="0.01"
            min="0"
            {...form.register('unit_cost', {
              valueAsNumber: true,
              setValueAs: (v) => (v === '' ? null : v),
            })}
          />
        </FormField>
      </div>

      <FormField
        label="Location"
        htmlFor="location_id"
        error={form.formState.errors.location_id?.message}
      >
        <Controller
          name="location_id"
          control={form.control}
          render={({ field }) => (
            <Select
              value={field.value || 'none'}
              onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
            >
              <SelectTrigger id="location_id">
                <SelectValue placeholder="Select location (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {locations?.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField
        label="Image URL"
        htmlFor="image_url"
        error={form.formState.errors.image_url?.message}
      >
        <Input id="image_url" type="url" {...form.register('image_url')} />
      </FormField>

      <FormField label="Notes" htmlFor="notes" error={form.formState.errors.notes?.message}>
        <Textarea id="notes" {...form.register('notes')} rows={3} />
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

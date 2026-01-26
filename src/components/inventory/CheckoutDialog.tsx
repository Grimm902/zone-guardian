import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { equipmentCheckoutSchema, type EquipmentCheckoutFormData } from '@/lib/validations';
import { useLocations } from '@/hooks/queries/useInventory';
import type { EquipmentItem } from '@/types/inventory';
import { Loader2 } from 'lucide-react';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: EquipmentItem;
  onCheckout: (data: EquipmentCheckoutFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export const CheckoutDialog = ({
  open,
  onOpenChange,
  equipment,
  onCheckout,
  isLoading = false,
}: CheckoutDialogProps) => {
  const { data: locations } = useLocations();

  const form = useForm<EquipmentCheckoutFormData>({
    resolver: zodResolver(equipmentCheckoutSchema),
    defaultValues: {
      equipment_id: equipment.id,
      quantity: 1,
      expected_return_date: '',
      destination_location_id: null,
      notes: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onCheckout(data);
    form.reset();
    onOpenChange(false);
  });

  const maxQuantity = equipment.quantity_available;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Check Out Equipment</DialogTitle>
          <DialogDescription>
            Check out {equipment.name}. Available: {equipment.quantity_available}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Quantity"
            htmlFor="quantity"
            error={form.formState.errors.quantity?.message}
            required
          >
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              {...form.register('quantity', {
                valueAsNumber: true,
                validate: (value) => {
                  if (value < 1) return 'Quantity must be at least 1';
                  if (value > maxQuantity) {
                    return `Quantity cannot exceed available amount (${maxQuantity})`;
                  }
                  return true;
                },
              })}
            />
          </FormField>

          <FormField
            label="Expected Return Date"
            htmlFor="expected_return_date"
            error={form.formState.errors.expected_return_date?.message}
          >
            <Input
              id="expected_return_date"
              type="date"
              {...form.register('expected_return_date')}
            />
          </FormField>

          <FormField
            label="Destination Location"
            htmlFor="destination_location_id"
            error={form.formState.errors.destination_location_id?.message}
          >
            <Controller
              name="destination_location_id"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value || 'none'}
                  onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                >
                  <SelectTrigger id="destination_location_id">
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

          <FormField label="Notes" htmlFor="notes" error={form.formState.errors.notes?.message}>
            <Textarea id="notes" {...form.register('notes')} rows={3} />
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || maxQuantity === 0}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check Out
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

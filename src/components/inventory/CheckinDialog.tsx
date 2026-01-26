import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { equipmentCheckinSchema, type EquipmentCheckinFormData } from '@/lib/validations';
import type { EquipmentCheckout } from '@/types/inventory';
import { Loader2 } from 'lucide-react';

interface CheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkout: EquipmentCheckout;
  onCheckin: (data: EquipmentCheckinFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export const CheckinDialog = ({
  open,
  onOpenChange,
  checkout,
  onCheckin,
  isLoading = false,
}: CheckinDialogProps) => {
  const form = useForm<EquipmentCheckinFormData>({
    resolver: zodResolver(equipmentCheckinSchema),
    defaultValues: {
      checkout_id: checkout.id,
      notes: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onCheckin(data);
    form.reset();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Check In Equipment</DialogTitle>
          <DialogDescription>
            Check in {checkout.equipment?.name} (Quantity: {checkout.quantity})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Notes" htmlFor="notes" error={form.formState.errors.notes?.message}>
            <Textarea
              id="notes"
              {...form.register('notes')}
              rows={3}
              placeholder="Optional notes..."
            />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check In
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

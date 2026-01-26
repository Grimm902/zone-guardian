import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from '@/hooks/queries/useInventory';
import { useAuth } from '@/contexts/AuthContext';
import { canManageInventory } from '@/lib/permissions';
import { locationSchema, type LocationFormData } from '@/lib/validations';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { RoleRoute } from '@/components/auth/RoleRoute';
import { LOCATION_TYPE_LABELS } from '@/types/inventory';

const InventoryLocations = () => {
  const { role } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);

  const { data: locations, isLoading, error } = useLocations(true);
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();

  const canManage = canManageInventory(role);

  const createForm = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      type: 'warehouse',
      address: '',
      is_active: true,
    },
  });

  const editForm = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
  });

  const handleCreate = async (data: LocationFormData) => {
    try {
      await createLocation.mutateAsync(data);
      toast.success('Location created successfully');
      setIsCreateDialogOpen(false);
      createForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create location');
    }
  };

  const handleEdit = (locationId: string) => {
    const location = locations?.find((l) => l.id === locationId);
    if (location) {
      editForm.reset({
        name: location.name,
        type: location.type,
        address: location.address || '',
        is_active: location.is_active,
      });
      setEditingLocation(locationId);
    }
  };

  const handleUpdate = async (data: LocationFormData) => {
    if (!editingLocation) return;
    try {
      await updateLocation.mutateAsync({ id: editingLocation, updates: data });
      toast.success('Location updated successfully');
      setEditingLocation(null);
      editForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update location');
    }
  };

  const handleDelete = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteLocation.mutateAsync(locationId);
      toast.success('Location deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete location');
    }
  };

  if (!canManage) {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You do not have permission to manage locations.</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <RoleRoute allowedRoles={['tcm', 'sm', 'dc', 'fs']}>
      <AppLayout>
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-bold text-foreground">Locations</h1>
              <p className="text-muted-foreground">Manage warehouses and job sites</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>

          {/* Locations List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading locations..." />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to load locations'}
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Locations</CardTitle>
                <CardDescription>
                  {locations?.length || 0} location{locations?.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations && locations.length > 0 ? (
                      locations.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium">{location.name}</TableCell>
                          <TableCell>{LOCATION_TYPE_LABELS[location.type]}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {location.address || '—'}
                          </TableCell>
                          <TableCell>
                            {location.is_active ? (
                              <span className="text-success">Active</span>
                            ) : (
                              <span className="text-muted-foreground">Inactive</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(location.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(location.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No locations found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Create Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Location</DialogTitle>
                <DialogDescription>Create a new warehouse or job site</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={createForm.handleSubmit(handleCreate)}
                className="space-y-4"
              >
                <FormField
                  label="Name"
                  htmlFor="name"
                  error={createForm.formState.errors.name?.message}
                  required
                >
                  <Input id="name" {...createForm.register('name')} />
                </FormField>
                <FormField
                  label="Type"
                  htmlFor="type"
                  error={createForm.formState.errors.type?.message}
                  required
                >
                  <Controller
                    name="type"
                    control={createForm.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warehouse">Warehouse</SelectItem>
                          <SelectItem value="job_site">Job Site</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField
                  label="Address"
                  htmlFor="address"
                  error={createForm.formState.errors.address?.message}
                >
                  <Textarea id="address" {...createForm.register('address')} rows={2} />
                </FormField>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={createForm.watch('is_active')}
                    onCheckedChange={(checked) => createForm.setValue('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLocation.isPending}>
                    Create
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={!!editingLocation} onOpenChange={(open) => !open && setEditingLocation(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Location</DialogTitle>
                <DialogDescription>Update location details</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={editForm.handleSubmit(handleUpdate)}
                className="space-y-4"
              >
                <FormField
                  label="Name"
                  htmlFor="edit-name"
                  error={editForm.formState.errors.name?.message}
                  required
                >
                  <Input id="edit-name" {...editForm.register('name')} />
                </FormField>
                <FormField
                  label="Type"
                  htmlFor="edit-type"
                  error={editForm.formState.errors.type?.message}
                  required
                >
                  <Controller
                    name="type"
                    control={editForm.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="edit-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warehouse">Warehouse</SelectItem>
                          <SelectItem value="job_site">Job Site</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField
                  label="Address"
                  htmlFor="edit-address"
                  error={editForm.formState.errors.address?.message}
                >
                  <Textarea id="edit-address" {...editForm.register('address')} rows={2} />
                </FormField>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-is_active"
                    checked={editForm.watch('is_active')}
                    onCheckedChange={(checked) => editForm.setValue('is_active', checked)}
                  />
                  <Label htmlFor="edit-is_active">Active</Label>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingLocation(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateLocation.isPending}>
                    Update
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </AppLayout>
    </RoleRoute>
  );
};

export default InventoryLocations;

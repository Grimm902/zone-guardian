import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConditionBadge } from '@/components/inventory/ConditionBadge';
import { EquipmentForm } from '@/components/inventory/EquipmentForm';
import { CheckoutDialog } from '@/components/inventory/CheckoutDialog';
import { CheckinDialog } from '@/components/inventory/CheckinDialog';
import { MaintenanceForm } from '@/components/inventory/MaintenanceForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useEquipmentById,
  useUpdateEquipment,
  useDeleteEquipment,
} from '@/hooks/queries/useInventory';
import {
  useCheckouts,
  useCheckoutEquipment,
  useCheckinEquipment,
} from '@/hooks/queries/useInventory';
import { useMaintenance, useCreateMaintenance } from '@/hooks/queries/useInventory';
import { useAuth } from '@/contexts/AuthContext';
import { canManageInventory, canCheckoutEquipment } from '@/lib/permissions';
import type {
  EquipmentItemFormData,
  EquipmentCheckoutFormData,
  EquipmentCheckinFormData,
  EquipmentMaintenanceFormData,
} from '@/types/inventory';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  MapPin,
  Calendar,
  Wrench,
  LogOut,
  LogIn,
} from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const InventoryItem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isCheckinDialogOpen, setIsCheckinDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState<string | null>(null);

  const { data: equipment, isLoading, error } = useEquipmentById(id || null);
  const { data: checkouts } = useCheckouts({ equipment_id: id });
  const { data: maintenance } = useMaintenance({ equipment_id: id });

  const updateEquipment = useUpdateEquipment();
  const deleteEquipment = useDeleteEquipment();
  const checkoutEquipment = useCheckoutEquipment();
  const checkinEquipment = useCheckinEquipment();
  const createMaintenance = useCreateMaintenance();

  const canManage = canManageInventory(role);
  const canCheckout = canCheckoutEquipment(role);

  const activeCheckouts = checkouts?.filter((c) => !c.checked_in_at) || [];
  const selectedCheckoutData = selectedCheckout
    ? checkouts?.find((c) => c.id === selectedCheckout)
    : null;

  const handleUpdateEquipment = async (data: EquipmentItemFormData) => {
    if (!id) return;
    try {
      await updateEquipment.mutateAsync({ id, updates: data });
      toast.success('Equipment updated successfully');
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update equipment');
    }
  };

  const handleDeleteEquipment = async () => {
    if (!id) return;
    if (
      !confirm('Are you sure you want to delete this equipment item? This action cannot be undone.')
    ) {
      return;
    }
    try {
      await deleteEquipment.mutateAsync(id);
      toast.success('Equipment deleted successfully');
      navigate('/app/inventory');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete equipment');
    }
  };

  const handleCheckout = async (data: EquipmentCheckoutFormData) => {
    try {
      await checkoutEquipment.mutateAsync(data);
      toast.success('Equipment checked out successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to checkout equipment');
    }
  };

  const handleCheckin = async (data: EquipmentCheckinFormData) => {
    try {
      await checkinEquipment.mutateAsync(data);
      toast.success('Equipment checked in successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to checkin equipment');
    }
  };

  const handleCreateMaintenance = async (data: EquipmentMaintenanceFormData) => {
    try {
      await createMaintenance.mutateAsync(data);
      toast.success('Maintenance record created successfully');
      setIsMaintenanceDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create maintenance record');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading equipment..." />
        </div>
      </AppLayout>
    );
  }

  if (error || !equipment) {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load equipment item'}
          </AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  const availablePercentage =
    equipment.quantity_total > 0
      ? (equipment.quantity_available / equipment.quantity_total) * 100
      : 0;

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/inventory')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold text-foreground">{equipment.name}</h1>
              <ConditionBadge condition={equipment.condition} />
            </div>
            {equipment.category && (
              <p className="text-muted-foreground">{equipment.category.name}</p>
            )}
          </div>
          {canManage && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDeleteEquipment}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipment.quantity_total}</div>
              <p className="text-xs text-muted-foreground">
                {equipment.quantity_available} available,{' '}
                {equipment.quantity_total - equipment.quantity_available} checked out
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Location</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipment.location?.name || 'Not assigned'}</div>
              {equipment.location && (
                <p className="text-xs text-muted-foreground">{equipment.location.address}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Availability</CardTitle>
              <Package className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(availablePercentage)}%</div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${availablePercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details and Actions */}
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="checkouts">Checkouts ({activeCheckouts.length})</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {equipment.description && (
                  <div>
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">{equipment.description}</p>
                  </div>
                )}

                {equipment.code && (
                  <div>
                    <p className="text-sm font-medium mb-1">Code</p>
                    <p className="text-sm text-muted-foreground">{equipment.code}</p>
                  </div>
                )}

                {equipment.unit_cost !== null && (
                  <div>
                    <p className="text-sm font-medium mb-1">Unit Cost</p>
                    <p className="text-sm text-muted-foreground">
                      ${equipment.unit_cost.toFixed(2)}
                    </p>
                  </div>
                )}

                {equipment.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{equipment.notes}</p>
                  </div>
                )}

                {canCheckout && equipment.quantity_available > 0 && (
                  <div className="pt-4 border-t">
                    <Button onClick={() => setIsCheckoutDialogOpen(true)}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Check Out Equipment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkouts" className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Checkout History</CardTitle>
              {canCheckout && equipment.quantity_available > 0 && (
                <Button onClick={() => setIsCheckoutDialogOpen(true)}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Check Out
                </Button>
              )}
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Checked Out By</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Expected Return</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkouts && checkouts.length > 0 ? (
                      checkouts.map((checkout) => (
                        <TableRow key={checkout.id}>
                          <TableCell>
                            {checkout.checked_out_by_profile?.full_name || 'Unknown'}
                          </TableCell>
                          <TableCell>{checkout.quantity}</TableCell>
                          <TableCell>
                            {new Date(checkout.checked_out_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {checkout.expected_return_date
                              ? new Date(checkout.expected_return_date).toLocaleDateString()
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {checkout.checked_in_at ? (
                              <span className="text-success">Checked In</span>
                            ) : (
                              <span className="text-destructive">Active</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!checkout.checked_in_at && canCheckout && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCheckout(checkout.id);
                                  setIsCheckinDialogOpen(true);
                                }}
                              >
                                <LogIn className="h-3 w-3 mr-1" />
                                Check In
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No checkout records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Maintenance History</CardTitle>
              {canManage && (
                <Button onClick={() => setIsMaintenanceDialogOpen(true)}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Record Maintenance
                </Button>
              )}
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Next Scheduled</TableHead>
                      <TableHead>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenance && maintenance.length > 0 ? (
                      maintenance.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.maintenance_type}</TableCell>
                          <TableCell>
                            {record.performed_by_profile?.full_name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {new Date(record.performed_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {record.next_scheduled_date
                              ? new Date(record.next_scheduled_date).toLocaleDateString()
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {record.cost !== null ? `$${record.cost.toFixed(2)}` : '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No maintenance records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        {canManage && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Equipment</DialogTitle>
                <DialogDescription>Update equipment item details</DialogDescription>
              </DialogHeader>
              <EquipmentForm
                defaultValues={equipment}
                onSubmit={handleUpdateEquipment}
                onCancel={() => setIsEditDialogOpen(false)}
                isLoading={updateEquipment.isPending}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Checkout Dialog */}
        {canCheckout && (
          <CheckoutDialog
            open={isCheckoutDialogOpen}
            onOpenChange={setIsCheckoutDialogOpen}
            equipment={equipment}
            onCheckout={handleCheckout}
            isLoading={checkoutEquipment.isPending}
          />
        )}

        {/* Checkin Dialog */}
        {canCheckout && selectedCheckoutData && (
          <CheckinDialog
            open={isCheckinDialogOpen}
            onOpenChange={(open) => {
              setIsCheckinDialogOpen(open);
              if (!open) setSelectedCheckout(null);
            }}
            checkout={selectedCheckoutData}
            onCheckin={handleCheckin}
            isLoading={checkinEquipment.isPending}
          />
        )}

        {/* Maintenance Dialog */}
        {canManage && (
          <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Record Maintenance</DialogTitle>
                <DialogDescription>Add a maintenance or inspection record</DialogDescription>
              </DialogHeader>
              <MaintenanceForm
                equipmentId={equipment.id}
                onSubmit={handleCreateMaintenance}
                onCancel={() => setIsMaintenanceDialogOpen(false)}
                isLoading={createMaintenance.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
};

export default InventoryItem;

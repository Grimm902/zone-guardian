import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EquipmentCard } from '@/components/inventory/EquipmentCard';
import { EquipmentTable } from '@/components/inventory/EquipmentTable';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { EquipmentForm } from '@/components/inventory/EquipmentForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEquipment, useCreateEquipment } from '@/hooks/queries/useInventory';
import { useAuth } from '@/contexts/AuthContext';
import { canManageInventory } from '@/lib/permissions';
import type { EquipmentFilters, EquipmentItemFormData } from '@/types/inventory';
import { Package, Plus, Grid3x3, List, Settings, Tag, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Inventory = () => {
  const { role } = useAuth();
  const [filters, setFilters] = useState<EquipmentFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: equipment, isLoading } = useEquipment(filters);
  const createEquipment = useCreateEquipment();

  const canManage = canManageInventory(role);

  const handleCreateEquipment = async (data: EquipmentItemFormData) => {
    try {
      await createEquipment.mutateAsync(data);
      toast.success('Equipment item created successfully');
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create equipment item');
    }
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold text-foreground">Inventory</h1>
            <p className="text-muted-foreground">
              Manage and track temporary traffic control equipment
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <>
                <Button variant="outline" asChild>
                  <Link to="/app/inventory/categories">
                    <Tag className="h-4 w-4 mr-2" />
                    Categories
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/app/inventory/locations">
                    <MapPin className="h-4 w-4 mr-2" />
                    Locations
                  </Link>
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{equipment?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Equipment items in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Package className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {equipment?.reduce((sum, item) => sum + item.quantity_available, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">Items available for checkout</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
              <Package className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {equipment?.reduce(
                  (sum, item) => sum + (item.quantity_total - item.quantity_available),
                  0
                ) || 0}
              </div>
              <p className="text-xs text-muted-foreground">Items currently checked out</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <InventoryFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClear={handleClearFilters}
        />

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {equipment?.length || 0} item{equipment?.length !== 1 ? 's' : ''}
          </div>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'table')}>
            <TabsList>
              <TabsTrigger value="grid">
                <Grid3x3 className="h-4 w-4 mr-2" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="table">
                <List className="h-4 w-4 mr-2" />
                Table
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Equipment List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading equipment...</div>
        ) : equipment && equipment.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {equipment.map((item) => (
                <EquipmentCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <EquipmentTable items={equipment} />
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No equipment items found</p>
              {canManage && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Equipment Item
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Dialog */}
        {canManage && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Equipment Item</DialogTitle>
                <DialogDescription>
                  Add a new equipment item to the inventory system
                </DialogDescription>
              </DialogHeader>
              <EquipmentForm
                onSubmit={handleCreateEquipment}
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={createEquipment.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
};

export default Inventory;

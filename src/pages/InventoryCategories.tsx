import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/FormField';
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
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/queries/useInventory';
import { useAuth } from '@/contexts/AuthContext';
import { canManageInventory } from '@/lib/permissions';
import { equipmentCategorySchema, type EquipmentCategoryFormData } from '@/lib/validations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { RoleRoute } from '@/components/auth/RoleRoute';

const InventoryCategories = () => {
  const { role } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const { data: categories, isLoading, error } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const canManage = canManageInventory(role);

  const createForm = useForm<EquipmentCategoryFormData>({
    resolver: zodResolver(equipmentCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const editForm = useForm<EquipmentCategoryFormData>({
    resolver: zodResolver(equipmentCategorySchema),
  });

  const handleCreate = async (data: EquipmentCategoryFormData) => {
    try {
      await createCategory.mutateAsync(data);
      toast.success('Category created successfully');
      setIsCreateDialogOpen(false);
      createForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create category');
    }
  };

  const handleEdit = (categoryId: string) => {
    const category = categories?.find((c) => c.id === categoryId);
    if (category) {
      editForm.reset({
        name: category.name,
        description: category.description || '',
      });
      setEditingCategory(categoryId);
    }
  };

  const handleUpdate = async (data: EquipmentCategoryFormData) => {
    if (!editingCategory) return;
    try {
      await updateCategory.mutateAsync({ id: editingCategory, updates: data });
      toast.success('Category updated successfully');
      setEditingCategory(null);
      editForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update category');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteCategory.mutateAsync(categoryId);
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  if (!canManage) {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You do not have permission to manage categories.</AlertDescription>
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
              <h1 className="text-3xl font-display font-bold text-foreground">
                Equipment Categories
              </h1>
              <p className="text-muted-foreground">Manage equipment categories</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Categories List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading categories..." />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to load categories'}
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  {categories?.length || 0} categor{categories?.length !== 1 ? 'ies' : 'y'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {category.description || '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(category.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(category.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No categories found
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
                <DialogTitle>Add Category</DialogTitle>
                <DialogDescription>Create a new equipment category</DialogDescription>
              </DialogHeader>
              <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                <FormField
                  label="Name"
                  htmlFor="name"
                  error={createForm.formState.errors.name?.message}
                  required
                >
                  <Input id="name" {...createForm.register('name')} />
                </FormField>
                <FormField
                  label="Description"
                  htmlFor="description"
                  error={createForm.formState.errors.description?.message}
                >
                  <Textarea id="description" {...createForm.register('description')} rows={3} />
                </FormField>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCategory.isPending}>
                    Create
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog
            open={!!editingCategory}
            onOpenChange={(open) => !open && setEditingCategory(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>Update category details</DialogDescription>
              </DialogHeader>
              <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
                <FormField
                  label="Name"
                  htmlFor="edit-name"
                  error={editForm.formState.errors.name?.message}
                  required
                >
                  <Input id="edit-name" {...editForm.register('name')} />
                </FormField>
                <FormField
                  label="Description"
                  htmlFor="edit-description"
                  error={editForm.formState.errors.description?.message}
                >
                  <Textarea id="edit-description" {...editForm.register('description')} rows={3} />
                </FormField>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateCategory.isPending}>
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

export default InventoryCategories;

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useCategories } from '@/hooks/queries/useInventory';
import { useLocations } from '@/hooks/queries/useInventory';
import type { EquipmentFilters, EquipmentCondition } from '@/types/inventory';
import { CONDITION_LABELS } from '@/types/inventory';

interface InventoryFiltersProps {
  filters: EquipmentFilters;
  onFiltersChange: (filters: EquipmentFilters) => void;
  onClear: () => void;
}

export const InventoryFilters = ({
  filters,
  onFiltersChange,
  onClear,
}: InventoryFiltersProps) => {
  const { data: categories } = useCategories();
  const { data: locations } = useLocations();

  const hasActiveFilters =
    filters.category_id || filters.condition || filters.location_id || filters.search;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7">
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Name, Code, or description..."
            value={filters.search || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                search: e.target.value || undefined,
              })
            }
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={filters.category_id || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                category_id: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select
            value={filters.condition || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                condition: value === 'all' ? undefined : (value as EquipmentCondition),
              })
            }
          >
            <SelectTrigger id="condition">
              <SelectValue placeholder="All conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All conditions</SelectItem>
              {(['good', 'fair', 'damaged', 'needs_repair', 'retired'] as EquipmentCondition[]).map(
                (condition) => (
                  <SelectItem key={condition} value={condition}>
                    {CONDITION_LABELS[condition]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select
            value={filters.location_id || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                location_id: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger id="location">
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations?.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

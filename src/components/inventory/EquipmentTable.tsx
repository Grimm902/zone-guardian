import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConditionBadge } from './ConditionBadge';
import { Button } from '@/components/ui/button';
import type { EquipmentItem } from '@/types/inventory';
import { Package, MapPin, ArrowRight } from 'lucide-react';

interface EquipmentTableProps {
  items: EquipmentItem[];
}

export const EquipmentTable = ({ items }: EquipmentTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Condition</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No equipment items found
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => {
            const availablePercentage =
              item.quantity_total > 0 ? (item.quantity_available / item.quantity_total) * 100 : 0;

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{item.name}</div>
                    {item.code && (
                      <div className="text-xs text-muted-foreground">Code: {item.code}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.category?.name || '—'}</TableCell>
                <TableCell>
                  <ConditionBadge condition={item.condition} />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {item.quantity_available} / {item.quantity_total}
                      </span>
                    </div>
                    {item.quantity_total > 0 && (
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${availablePercentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {item.location ? (
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{item.location.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/app/inventory/${item.id}`}>
                      View
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

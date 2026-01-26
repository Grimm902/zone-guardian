import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConditionBadge } from './ConditionBadge';
import type { EquipmentItem } from '@/types/inventory';
import { Package, MapPin } from 'lucide-react';

interface EquipmentCardProps {
  item: EquipmentItem;
}

export const EquipmentCard = ({ item }: EquipmentCardProps) => {
  const availablePercentage =
    item.quantity_total > 0 ? (item.quantity_available / item.quantity_total) * 100 : 0;

  return (
    <Link to={`/app/inventory/${item.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <ConditionBadge condition={item.condition} />
          </div>
          {item.category && (
            <p className="text-sm text-muted-foreground">{item.category.name}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Package className="h-3 w-3" />
                <span>Quantity</span>
              </div>
              <div className="font-medium">
                {item.quantity_available} / {item.quantity_total}
              </div>
            </div>

            {item.location && (
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3" />
                  <span>Location</span>
                </div>
                <div className="font-medium truncate">{item.location.name}</div>
              </div>
            )}
          </div>

          {item.quantity_total > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Availability</span>
                <span>{Math.round(availablePercentage)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${availablePercentage}%` }}
                />
              </div>
            </div>
          )}

          {item.code && (
            <p className="text-xs text-muted-foreground">Code: {item.code}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

import { Badge } from '@/components/ui/badge';
import { CONDITION_LABELS, CONDITION_COLORS, type EquipmentCondition } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface ConditionBadgeProps {
  condition: EquipmentCondition;
  className?: string;
}

export const ConditionBadge = ({ condition, className }: ConditionBadgeProps) => {
  return (
    <Badge className={cn(CONDITION_COLORS[condition], className)}>
      {CONDITION_LABELS[condition]}
    </Badge>
  );
};

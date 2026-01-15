import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { UserRole, ROLE_LABELS, ROLE_COLORS } from '@/types/auth';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export const RoleBadge = ({ role, className }: RoleBadgeProps) => {
  return (
    <Badge className={cn(ROLE_COLORS[role], 'font-medium', className)}>{ROLE_LABELS[role]}</Badge>
  );
};

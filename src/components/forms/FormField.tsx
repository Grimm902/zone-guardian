import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
  icon?: LucideIcon;
  required?: boolean;
  className?: string;
}

export const FormField = ({
  label,
  htmlFor,
  error,
  children,
  icon: Icon,
  required,
  className,
}: FormFieldProps) => {
  return (
    <div className={className || 'space-y-2'}>
      <Label htmlFor={htmlFor} className={Icon ? 'flex items-center gap-2' : ''}>
        {Icon && <Icon className="h-4 w-4" />}
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

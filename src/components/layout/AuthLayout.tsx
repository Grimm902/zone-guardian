import { type ReactNode } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-between p-12"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <AlertTriangle className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-xl font-display font-semibold text-primary-foreground dark:text-foreground">
              TrafficControl
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl xl:text-5xl font-display font-bold text-primary-foreground dark:text-foreground leading-tight">
            Secure Traffic Management System
          </h1>
          <p className="text-lg text-primary-foreground/80 dark:text-foreground/80 max-w-md">
            Role-based access control for traffic control professionals. Manage teams, coordinate
            operations, and ensure workplace safety.
          </p>
          <div className="flex items-center gap-2 text-primary-foreground/60 dark:text-foreground/70">
            <Shield className="h-5 w-5" />
            <span className="text-sm">Enterprise-grade security with RLS protection</span>
          </div>
        </div>

        <div className="text-sm text-primary-foreground/40 dark:text-foreground/60">
          © 2026 TrafficControl. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-accent rounded-lg">
              <AlertTriangle className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-xl font-display font-semibold text-foreground">
              TrafficControl
            </span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-display font-bold text-foreground">{title}</h2>
            {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

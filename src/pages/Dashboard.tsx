import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleBadge } from '@/components/ui/role-badge';
import { ROLE_LABELS } from '@/types/auth';
import { Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { profile, role } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground">
              Here's what's happening with your traffic control operations
            </p>
            {role && <RoleBadge role={role} />}
          </div>
        </div>

        {/* Role Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Your Access Level
            </CardTitle>
            <CardDescription>Based on your role in the organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{role ? ROLE_LABELS[role] : 'Unknown Role'}</p>
                  <p className="text-sm text-muted-foreground">
                    {role === 'tcm'
                      ? 'Full administrative access to all system features'
                      : 'Standard access based on your role permissions'}
                  </p>
                </div>
                {role && <RoleBadge role={role} />}
              </div>

              {role === 'tcm' && (
                <div className="flex items-start gap-3 p-4 bg-accent/20 dark:bg-accent/15 border border-accent/40 dark:border-accent/30 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-medium text-accent dark:text-accent">Administrator Notice</p>
                    <p className="text-sm text-muted-foreground dark:text-foreground/80">
                      As a Traffic Control Manager, you have access to user management features.
                      Navigate to User Management to view and manage user roles.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>View dashboard analytics</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Update personal profile</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>View assigned projects</span>
                </div>
                {role === 'tcm' && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Manage user roles</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;

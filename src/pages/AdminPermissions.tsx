import { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleBadge } from '@/components/ui/role-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, Route, Settings } from 'lucide-react';
import { UserRole, ROLE_LABELS, ROLE_PERMISSIONS, type Permission } from '@/types/auth';

const AdminPermissions = () => {
  const roles: UserRole[] = useMemo(() => ['tcm', 'sm', 'dc', 'fs', 'tws', 'tcp'], []);

  const groupedPermissions = (permissions: Permission[]) => {
    const routes = permissions.filter((p) => p.category === 'route');
    const actions = permissions.filter((p) => p.category === 'action');
    return { routes, actions };
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Role Permissions</h1>
          <p className="text-muted-foreground">
            View and understand permissions for each role in the system
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-accent/50 bg-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Permissions Overview
            </CardTitle>
            <CardDescription>
              This page displays all current permissions for each role. Permissions are enforced at
              both the application and database levels.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Permissions by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions by Role</CardTitle>
            <CardDescription>
              Select a role to view its detailed permissions and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tcm" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
                {roles.map((role) => (
                  <TabsTrigger key={role} value={role} className="text-xs sm:text-sm">
                    {ROLE_LABELS[role].split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {roles.map((role) => {
                const permissions = ROLE_PERMISSIONS[role];
                const { routes, actions } = groupedPermissions(permissions);

                return (
                  <TabsContent key={role} value={role} className="space-y-6">
                    {/* Role Header */}
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <h3 className="text-xl font-display font-semibold text-foreground">
                          {ROLE_LABELS[role]}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {permissions.length} permission{permissions.length !== 1 ? 's' : ''}{' '}
                          assigned
                        </p>
                      </div>
                      <RoleBadge role={role} />
                    </div>

                    {/* Route Permissions */}
                    {routes.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Route className="h-5 w-5 text-primary" />
                          <h4 className="text-lg font-semibold text-foreground">Route Access</h4>
                          <Badge variant="outline" className="ml-auto">
                            {routes.length}
                          </Badge>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {routes.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start gap-3 p-4 border rounded-lg bg-card"
                            >
                              <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground">{permission.name}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Permissions */}
                    {actions.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-primary" />
                          <h4 className="text-lg font-semibold text-foreground">Actions</h4>
                          <Badge variant="outline" className="ml-auto">
                            {actions.length}
                          </Badge>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {actions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start gap-3 p-4 border rounded-lg bg-card"
                            >
                              <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground">{permission.name}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Permissions Message */}
                    {permissions.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>No permissions assigned to this role.</p>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminPermissions;

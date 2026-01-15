import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleBadge } from '@/components/ui/role-badge';
import { ROLE_LABELS } from '@/types/auth';
import { ShieldX, ArrowLeft, Home, Mail } from 'lucide-react';

const Unauthorized = () => {
  const { role, profile } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-display">Access Denied</CardTitle>
          <CardDescription>You don't have permission to access this page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {role && (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Your current role:</p>
              <RoleBadge role={role} />
              <p className="text-sm text-muted-foreground mt-2">{ROLE_LABELS[role]}</p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              This area is restricted to Traffic Control Managers (TCM) only. If you need access,
              please contact your administrator.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/app">
              <Button className="w-full gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href="mailto:admin@company.com">
                <Mail className="h-4 w-4" />
                Contact Administrator
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;

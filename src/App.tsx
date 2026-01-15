import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleRoute } from '@/components/auth/RoleRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { initializeErrorTracking } from '@/lib/logger';

// Lazy load page components for code splitting
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.default })));
const Register = lazy(() =>
  import('./pages/Register').then((module) => ({ default: module.default }))
);
const ForgotPassword = lazy(() =>
  import('./pages/ForgotPassword').then((module) => ({ default: module.default }))
);
const ResetPassword = lazy(() =>
  import('./pages/ResetPassword').then((module) => ({ default: module.default }))
);
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((module) => ({ default: module.default }))
);
const Profile = lazy(() =>
  import('./pages/Profile').then((module) => ({ default: module.default }))
);
const Admin = lazy(() => import('./pages/Admin').then((module) => ({ default: module.default })));
const AdminUsers = lazy(() =>
  import('./pages/AdminUsers').then((module) => ({ default: module.default }))
);
const Unauthorized = lazy(() =>
  import('./pages/Unauthorized').then((module) => ({ default: module.default }))
);
const NotFound = lazy(() =>
  import('./pages/NotFound').then((module) => ({ default: module.default }))
);

// Initialize error tracking (async, but don't block app startup)
initializeErrorTracking().catch(() => {
  // Silently fail if initialization fails
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingSpinner size="lg" text="Loading page..." />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* Protected Routes */}
                  <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes (TCM only) */}
                  <Route
                    path="/app/admin"
                    element={
                      <ProtectedRoute>
                        <RoleRoute allowedRoles={['tcm']}>
                          <Admin />
                        </RoleRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/app/admin/users"
                    element={
                      <ProtectedRoute>
                        <RoleRoute allowedRoles={['tcm']}>
                          <AdminUsers />
                        </RoleRoute>
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { RoleRoute } from './RoleRoute';
import { useAuth } from '@/contexts/AuthContext';

// Mock the auth context
vi.mock('@/contexts/AuthContext', async () => {
  const actual =
    await vi.importActual<typeof import('@/contexts/AuthContext')>('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock LoadingSpinner
vi.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: ({ text }: { text: string }) => <div>Loading: {text}</div>,
}));

// Mock Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div>Navigate to: {to}</div>,
  };
});

describe('RoleRoute', () => {
  it('should show loading spinner when auth is loading', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      role: null,
      loading: true,
    });

    render(
      <RoleRoute allowedRoles={['tcm']}>
        <div>Admin Content</div>
      </RoleRoute>
    );

    expect(screen.getByText(/Loading: Checking permissions/i)).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      role: null,
      loading: false,
    });

    render(
      <RoleRoute allowedRoles={['tcm']}>
        <div>Admin Content</div>
      </RoleRoute>
    );

    expect(screen.getByText('Navigate to: /')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should redirect to unauthorized when user role is not allowed', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
      role: 'tcp',
      loading: false,
    });

    render(
      <RoleRoute allowedRoles={['tcm']}>
        <div>Admin Content</div>
      </RoleRoute>
    );

    expect(screen.getByText('Navigate to: /unauthorized')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should render children when user has allowed role', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
      role: 'tcm',
      loading: false,
    });

    render(
      <RoleRoute allowedRoles={['tcm', 'sm']}>
        <div>Admin Content</div>
      </RoleRoute>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.queryByText(/Navigate to/i)).not.toBeInTheDocument();
  });

  it('should allow multiple roles', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
      role: 'sm',
      loading: false,
    });

    render(
      <RoleRoute allowedRoles={['tcm', 'sm']}>
        <div>Admin Content</div>
      </RoleRoute>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});

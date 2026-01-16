import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { mockUser, mockSession, mockProfile } from '@/test/fixtures';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock next-themes to avoid matchMedia issues in tests
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
  }),
}));

// Simple wrapper for AuthContext tests (without AuthProvider since we're testing it)
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render for AuthContext tests
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

// Test component that uses useAuth
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{auth.user?.email || 'no-user'}</div>
      <div data-testid="profile">{auth.profile?.full_name || 'no-profile'}</div>
      <div data-testid="role">{auth.role || 'no-role'}</div>
      <button onClick={() => auth.signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => auth.signUp('test@example.com', 'password', 'Test User')}>
        Sign Up
      </button>
      <button onClick={() => auth.signOut()}>Sign Out</button>
      <button onClick={() => auth.refreshProfile()}>Refresh Profile</button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockMaybeSingle = vi.fn();
  const mockUpdate = vi.fn();
  const mockOnAuthStateChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase query chain mocks
    mockSelect.mockReturnValue({
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
      update: mockUpdate,
    });
    mockEq.mockReturnValue({
      maybeSingle: mockMaybeSingle,
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });

    // Setup auth state change mock
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    (supabase.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockImplementation((callback) => {
      return mockOnAuthStateChange();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Provider initialization', () => {
    it('should initialize with no session', async () => {
      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      renderWithProviders(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
    });

    it('should load profile when session exists', async () => {
      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockMaybeSingle.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      renderWithProviders(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });

      expect(screen.getByTestId('profile')).toHaveTextContent('Test User');
      expect(screen.getByTestId('role')).toHaveTextContent('tcm');
    });

    it('should handle profile fetch error gracefully', async () => {
      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' },
      });

      renderWithProviders(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  // TODO: Fix these tests - they have async timing issues
  describe.skip('signIn', () => {
    it('should sign in successfully', async () => {
      const { user } = await import('@testing-library/user-event');
      const userEvent = user.setup();

      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      mockMaybeSingle.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      renderWithProviders(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      const signInButton = screen.getByText('Sign In');
      await userEvent.click(signInButton);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should handle sign in error', async () => {
      const { user } = await import('@testing-library/user-event');
      const userEvent = user.setup();

      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const signInError = { message: 'Invalid credentials', status: 400 };
      (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: null, session: null },
        error: signInError,
      });

      renderWithProviders(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      const signInButton = screen.getByText('Sign In');
      await userEvent.click(signInButton);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });

  // TODO: Fix these tests - they have async timing issues
  describe.skip('signUp', () => {
    it('should sign up successfully', async () => {
      const { user } = await import('@testing-library/user-event');
      const userEvent = user.setup();

      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      (supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      renderWithProviders(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      const signUpButton = screen.getByText('Sign Up');
      await userEvent.click(signUpButton);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          emailRedirectTo: expect.stringContaining('/'),
          data: {
            full_name: 'Test User',
          },
        },
      });
    });

    it('should handle sign up error', async () => {
      const { user } = await import('@testing-library/user-event');
      const userEvent = user.setup();

      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const signUpError = { message: 'Email already exists', status: 400 };
      (supabase.auth.signUp as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { user: null, session: null },
        error: signUpError,
      });

      renderWithProviders(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      const signUpButton = screen.getByText('Sign Up');
      await userEvent.click(signUpButton);

      expect(supabase.auth.signUp).toHaveBeenCalled();
    });
  });

  // TODO: Fix these tests - they have async timing issues
  describe.skip('signOut', () => {
    it('should sign out successfully', async () => {
      const { user } = await import('@testing-library/user-event');
      const userEvent = user.setup();

      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockMaybeSingle.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      (supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue({
        error: null,
      });

      renderWithProviders(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });

      const signOutButton = screen.getByText('Sign Out');
      await userEvent.click(signOutButton);

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  // TODO: Fix these tests - they have async timing issues
  describe.skip('refreshProfile', () => {
    it('should refresh profile successfully', async () => {
      const { user } = await import('@testing-library/user-event');
      const userEvent = user.setup();

      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const updatedProfile = { ...mockProfile, full_name: 'Updated Name' };
      mockMaybeSingle
        .mockResolvedValueOnce({
          data: mockProfile,
          error: null,
        })
        .mockResolvedValueOnce({
          data: updatedProfile,
          error: null,
        });

      renderWithProviders(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile')).toHaveTextContent('Test User');
      });

      const refreshButton = screen.getByText('Refresh Profile');
      await userEvent.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByTestId('profile')).toHaveTextContent('Updated Name');
      });
    });

    it('should handle refresh when no user is logged in', async () => {
      const { user } = await import('@testing-library/user-event');
      const userEvent = user.setup();

      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      renderWithProviders(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      const refreshButton = screen.getByText('Refresh Profile');
      await userEvent.click(refreshButton);

      // Should not throw error, just do nothing
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderWithProviders(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('auth state change listener', () => {
    it('should update state when auth state changes', async () => {
      let authStateCallback: (event: string, session: typeof mockSession | null) => void;

      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      (supabase.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockImplementation(
        (callback) => {
          authStateCallback = callback;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        }
      );

      mockMaybeSingle.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      renderWithProviders(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      // Simulate auth state change
      if (authStateCallback!) {
        authStateCallback('SIGNED_IN', mockSession);
      }

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });
    });

    it('should clear profile on sign out event', async () => {
      let authStateCallback: (event: string, session: typeof mockSession | null) => void;

      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      mockMaybeSingle.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      (supabase.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockImplementation(
        (callback) => {
          authStateCallback = callback;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        }
      );

      renderWithProviders(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('profile')).toHaveTextContent('Test User');
      });

      // Simulate sign out
      if (authStateCallback!) {
        authStateCallback('SIGNED_OUT', null);
      }

      await waitFor(() => {
        expect(screen.getByTestId('profile')).toHaveTextContent('no-profile');
        expect(screen.getByTestId('role')).toHaveTextContent('no-role');
      });
    });
  });
});

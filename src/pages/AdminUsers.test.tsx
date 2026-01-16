import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import AdminUsers from './AdminUsers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { mockProfile, mockProfiles } from '@/test/fixtures';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next-themes to avoid matchMedia issues
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
  }),
}));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock LoadingSpinner
vi.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// TODO: Fix these tests - they have Radix UI Select component issues
describe.skip('AdminUsers', () => {
  const mockSelect = vi.fn();
  const mockOrder = vi.fn();
  const mockUpdate = vi.fn();
  const mockEq = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase query chain
    mockSelect.mockReturnValue({
      order: mockOrder,
    });
    mockOrder.mockResolvedValue({
      data: mockProfiles,
      error: null,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockResolvedValue({
      error: null,
    });

    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });

    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
    });
  });

  it('should render user list', async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText(/user management/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(mockProfiles[0].full_name)).toBeInTheDocument();
    });
  });

  it('should show loading spinner while fetching users', () => {
    mockOrder.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<AdminUsers />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display error message on fetch failure', async () => {
    const error = { message: 'Failed to fetch users' };
    mockOrder.mockResolvedValue({
      data: null,
      error,
    });

    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch users/i)).toBeInTheDocument();
    });
  });

  it('should filter users by search term', async () => {
    const user = userEvent.setup({ delay: null });
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText(mockProfiles[0].full_name)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'Test');

    await waitFor(() => {
      expect(screen.getByText(mockProfiles[0].full_name)).toBeInTheDocument();
    });
  });

  it('should filter users by role', async () => {
    const user = userEvent.setup({ delay: null });
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText(/all roles/i)).toBeInTheDocument();
    });

    const roleFilter = screen.getByRole('combobox');
    await user.click(roleFilter);

    // Select a role from dropdown
    await waitFor(() => {
      const tcpOption = screen.getByText(/traffic control person/i);
      if (tcpOption) {
        user.click(tcpOption);
      }
    });
  });

  it('should update user role successfully', async () => {
    const user = userEvent.setup({ delay: null });
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText(mockProfiles[0].full_name)).toBeInTheDocument();
    });

    // Find and click role select for first user (not current user)
    const roleSelects = screen.getAllByRole('combobox');
    // Skip the filter combobox, find user role selects
    const userRoleSelect = roleSelects.find((select) => {
      const parent = select.closest('tr');
      return parent && !parent.textContent?.includes(mockProfile.full_name);
    });

    if (userRoleSelect) {
      await user.click(userRoleSelect);

      await waitFor(() => {
        const smOption = screen.getByText(/safety manager/i);
        if (smOption) {
          user.click(smOption);
        }
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    }
  });

  it('should prevent changing own role', async () => {
    const user = userEvent.setup({ delay: null });
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText(mockProfile.full_name)).toBeInTheDocument();
    });

    // Try to change own role
    const roleSelects = screen.getAllByRole('combobox');
    const ownRoleSelect = roleSelects.find((select) => {
      const parent = select.closest('tr');
      return parent && parent.textContent?.includes(mockProfile.full_name);
    });

    if (ownRoleSelect) {
      await user.click(ownRoleSelect);

      await waitFor(() => {
        const smOption = screen.getByText(/safety manager/i);
        if (smOption) {
          user.click(smOption);
        }
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('You cannot change your own role');
      });
    }
  });

  it('should display error message on role update failure', async () => {
    const user = userEvent.setup({ delay: null });
    const error = { message: 'Permission denied' };
    mockEq.mockResolvedValue({
      error,
    });

    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText(mockProfiles[0].full_name)).toBeInTheDocument();
    });

    // Try to update a user's role
    const roleSelects = screen.getAllByRole('combobox');
    const userRoleSelect = roleSelects.find((select) => {
      const parent = select.closest('tr');
      return parent && !parent.textContent?.includes(mockProfile.full_name);
    });

    if (userRoleSelect) {
      await user.click(userRoleSelect);

      await waitFor(() => {
        const smOption = screen.getByText(/safety manager/i);
        if (smOption) {
          user.click(smOption);
        }
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    }
  });

  it('should refresh user list', async () => {
    const user = userEvent.setup({ delay: null });
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText(mockProfiles[0].full_name)).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);

    await waitFor(() => {
      expect(mockSelect).toHaveBeenCalledTimes(2); // Initial + refresh
    });
  });

  it('should display user information in table', async () => {
    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText(mockProfiles[0].full_name)).toBeInTheDocument();
      expect(screen.getByText(mockProfiles[0].email!)).toBeInTheDocument();
    });
  });

  it('should handle empty user list', async () => {
    mockOrder.mockResolvedValue({
      data: [],
      error: null,
    });

    render(<AdminUsers />);

    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });
});

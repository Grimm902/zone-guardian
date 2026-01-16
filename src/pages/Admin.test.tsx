import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import Admin from './Admin';
import { useAuth } from '@/contexts/AuthContext';
import { mockProfile } from '@/test/fixtures';

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

describe('Admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render admin dashboard', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
    });

    render(<Admin />);

    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/manage system settings/i)).toBeInTheDocument();
  });

  it('should show admin access card', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
    });

    render(<Admin />);

    expect(screen.getByText(/administrator access/i)).toBeInTheDocument();
    expect(screen.getByText(/traffic control manager/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome, test user/i)).toBeInTheDocument();
  });

  it('should display user management card', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
    });

    render(<Admin />);

    expect(screen.getByText(/user management/i)).toBeInTheDocument();
    expect(screen.getByText(/view and manage user accounts/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /manage users/i })).toBeInTheDocument();
  });

  it('should display permissions card', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
    });

    render(<Admin />);

    expect(screen.getByText(/permissions/i)).toBeInTheDocument();
    expect(screen.getByText(/view role-based permissions/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view permissions/i })).toBeInTheDocument();
  });

  it('should display system settings card', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
    });

    render(<Admin />);

    expect(screen.getByText(/system settings/i)).toBeInTheDocument();
    expect(screen.getByText(/configure system-wide settings/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /coming soon/i })).toBeDisabled();
  });

  it('should have navigation links to admin sections', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
    });

    render(<Admin />);

    const manageUsersLink = screen.getByRole('link', { name: /manage users/i });
    expect(manageUsersLink).toHaveAttribute('href', '/app/admin/users');

    const viewPermissionsLink = screen.getByRole('link', { name: /view permissions/i });
    expect(viewPermissionsLink).toHaveAttribute('href', '/app/admin/permissions');
  });

  it('should have quick actions section', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
    });

    render(<Admin />);

    expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view all users/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /your profile/i })).toBeInTheDocument();
  });

  it('should have link to profile in quick actions', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
    });

    render(<Admin />);

    const profileLink = screen.getByRole('link', { name: /your profile/i });
    expect(profileLink).toHaveAttribute('href', '/app/profile');
  });

  it('should handle missing profile gracefully', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: null,
    });

    render(<Admin />);

    expect(screen.getByText(/welcome, administrator/i)).toBeInTheDocument();
  });
});

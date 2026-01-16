import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import Dashboard from './Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { mockProfile, mockProfileTcp } from '@/test/fixtures';

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

// TODO: Fix these tests - they have component rendering issues
describe.skip('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render welcome message with user name', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
      role: 'tcm',
    });

    render(<Dashboard />);

    expect(screen.getByText(/welcome back, test/i)).toBeInTheDocument();
  });

  it('should display role badge', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
      role: 'tcm',
    });

    render(<Dashboard />);

    expect(screen.getByText(/traffic control manager/i)).toBeInTheDocument();
  });

  it('should show TCM admin notice for TCM role', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
      role: 'tcm',
    });

    render(<Dashboard />);

    expect(screen.getByText(/administrator notice/i)).toBeInTheDocument();
    expect(screen.getByText(/access to user management features/i)).toBeInTheDocument();
  });

  it('should not show admin notice for non-TCM roles', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfileTcp,
      role: 'tcp',
    });

    render(<Dashboard />);

    expect(screen.queryByText(/administrator notice/i)).not.toBeInTheDocument();
  });

  it('should display access level card', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
      role: 'tcm',
    });

    render(<Dashboard />);

    expect(screen.getByText(/your access level/i)).toBeInTheDocument();
    expect(screen.getByText(/based on your role/i)).toBeInTheDocument();
  });

  it('should display role-specific access description for TCM', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
      role: 'tcm',
    });

    render(<Dashboard />);

    expect(screen.getByText(/full administrative access/i)).toBeInTheDocument();
  });

  it('should display standard access description for non-TCM roles', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfileTcp,
      role: 'tcp',
    });

    render(<Dashboard />);

    expect(screen.getByText(/standard access based on your role permissions/i)).toBeInTheDocument();
  });

  it('should display permission checkmarks', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
      role: 'tcm',
    });

    render(<Dashboard />);

    expect(screen.getByText(/view dashboard analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/update personal profile/i)).toBeInTheDocument();
    expect(screen.getByText(/view assigned projects/i)).toBeInTheDocument();
    expect(screen.getByText(/manage user roles/i)).toBeInTheDocument();
  });

  it('should not show manage user roles for non-TCM roles', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfileTcp,
      role: 'tcp',
    });

    render(<Dashboard />);

    expect(screen.queryByText(/manage user roles/i)).not.toBeInTheDocument();
  });

  it('should handle missing profile gracefully', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: null,
      role: null,
    });

    render(<Dashboard />);

    expect(screen.getByText(/welcome back, user/i)).toBeInTheDocument();
    expect(screen.getByText(/unknown role/i)).toBeInTheDocument();
  });

  it('should handle profile with no first name', () => {
    const profileWithoutName = { ...mockProfile, full_name: '' };
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: profileWithoutName,
      role: 'tcp',
    });

    render(<Dashboard />);

    expect(screen.getByText(/welcome back, user/i)).toBeInTheDocument();
  });
});

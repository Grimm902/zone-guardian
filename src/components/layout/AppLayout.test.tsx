import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { AppLayout } from './AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockProfile } from '@/test/fixtures';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigate: vi.fn(),
  };
});

describe('AppLayout', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: '/app',
    });
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
      role: 'tcm',
      signOut: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('should render header with logo and navigation', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText(/trafficcontrol/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('should display user menu with profile info', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    // User menu trigger should be present
    const userMenuTrigger = screen.getByText('T'); // First letter of full name
    expect(userMenuTrigger).toBeInTheDocument();
  });

  it('should highlight active route', () => {
    (useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: '/app',
    });

    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
  });

  it('should display role badge', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText(/traffic control manager/i)).toBeInTheDocument();
  });

  it('should render children', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should handle sign out', async () => {
    const user = userEvent.setup();
    const mockSignOut = vi.fn().mockResolvedValue(undefined);
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
      role: 'tcm',
      signOut: mockSignOut,
    });

    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    // Open user menu
    const userMenuTrigger = screen.getByText('T');
    await user.click(userMenuTrigger);

    // Click sign out
    await waitFor(() => {
      const signOutButton = screen.getByText(/sign out/i);
      if (signOutButton) {
        user.click(signOutButton);
      }
    });

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should handle missing profile gracefully', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: null,
      role: null,
      signOut: vi.fn(),
    });

    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    // Should show 'U' for unnamed user
    expect(screen.getByText('U')).toBeInTheDocument();
  });
});

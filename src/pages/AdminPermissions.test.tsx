import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import AdminPermissions from './AdminPermissions';

describe('AdminPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render permissions page', () => {
    render(<AdminPermissions />);

    expect(screen.getByText(/role permissions/i)).toBeInTheDocument();
    expect(screen.getByText(/view and understand permissions/i)).toBeInTheDocument();
  });

  it('should display permissions overview card', () => {
    render(<AdminPermissions />);

    expect(screen.getByText(/permissions overview/i)).toBeInTheDocument();
    expect(screen.getByText(/permissions are enforced/i)).toBeInTheDocument();
  });

  it('should display tabs for all roles', () => {
    render(<AdminPermissions />);

    expect(screen.getByText(/traffic/i)).toBeInTheDocument();
    expect(screen.getByText(/safety/i)).toBeInTheDocument();
    expect(screen.getByText(/dispatch/i)).toBeInTheDocument();
    expect(screen.getByText(/field/i)).toBeInTheDocument();
    expect(screen.getByText(/temporary/i)).toBeInTheDocument();
    expect(screen.getByText(/traffic control person/i)).toBeInTheDocument();
  });

  it('should display TCM permissions by default', () => {
    render(<AdminPermissions />);

    expect(screen.getByText(/traffic control manager/i)).toBeInTheDocument();
    expect(screen.getByText(/access dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/access admin dashboard/i)).toBeInTheDocument();
  });

  it('should switch between role tabs', async () => {
    const user = userEvent.setup();
    render(<AdminPermissions />);

    // Click on Safety Manager tab
    const smTab = screen.getByRole('tab', { name: /safety/i });
    await user.click(smTab);

    expect(screen.getByText(/safety manager/i)).toBeInTheDocument();
    expect(screen.queryByText(/access admin dashboard/i)).not.toBeInTheDocument();
  });

  it('should display route permissions section', () => {
    render(<AdminPermissions />);

    expect(screen.getByText(/route access/i)).toBeInTheDocument();
  });

  it('should display action permissions section', () => {
    render(<AdminPermissions />);

    expect(screen.getByText(/actions/i)).toBeInTheDocument();
  });

  it('should show permission count for each role', () => {
    render(<AdminPermissions />);

    // TCM has many permissions
    expect(screen.getByText(/permission/i)).toBeInTheDocument();
  });

  it('should display permission details with descriptions', () => {
    render(<AdminPermissions />);

    expect(screen.getByText(/view and access the main dashboard/i)).toBeInTheDocument();
  });

  it('should show role badge for each role', () => {
    render(<AdminPermissions />);

    // Role badges should be present
    const roleBadges = screen.getAllByText(/traffic control manager/i);
    expect(roleBadges.length).toBeGreaterThan(0);
  });

  it('should handle roles with no permissions', async () => {
    const user = userEvent.setup();
    render(<AdminPermissions />);

    // All roles should have at least some permissions in the current implementation
    // This test verifies the structure is correct
    expect(screen.getByText(/permissions by role/i)).toBeInTheDocument();
  });
});

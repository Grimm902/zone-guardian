import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Profile from './Profile';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { mockProfile } from '@/test/fixtures';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock LoadingSpinner
vi.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: ({ size }: { size?: string }) => (
    <div data-testid="loading-spinner" data-size={size} />
  ),
}));

describe('Profile', () => {
  const mockUpdateProfile = vi.fn();
  const mockUpdatePassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: mockProfile,
      role: 'tcm',
      updateProfile: mockUpdateProfile,
      updatePassword: mockUpdatePassword,
    });
  });

  it('should render profile form with current data', () => {
    render(<Profile />);

    expect(screen.getByText(/profile settings/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProfile.full_name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProfile.email!)).toBeInTheDocument();
    if (mockProfile.phone) {
      expect(screen.getByDisplayValue(mockProfile.phone)).toBeInTheDocument();
    }
  });

  it('should display role information', () => {
    render(<Profile />);

    expect(screen.getByText(/role & permissions/i)).toBeInTheDocument();
    expect(screen.getByText(/traffic control manager/i)).toBeInTheDocument();
    expect(screen.getByText(/role changes can only be made/i)).toBeInTheDocument();
  });

  it('should update profile successfully', async () => {
    const user = userEvent.setup({ delay: null });
    mockUpdateProfile.mockResolvedValue({ error: null });

    render(<Profile />);

    const fullNameInput = screen.getByLabelText(/full name/i);
    const saveButton = screen.getByRole('button', { name: /save changes/i });

    await user.clear(fullNameInput);
    await user.type(fullNameInput, 'Updated Name');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        full_name: 'Updated Name',
        phone: mockProfile.phone,
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully');
    });
  });

  it('should display error message on profile update failure', async () => {
    const user = userEvent.setup({ delay: null });
    const error = new Error('Update failed');
    mockUpdateProfile.mockResolvedValue({ error });

    render(<Profile />);

    const fullNameInput = screen.getByLabelText(/full name/i);
    const saveButton = screen.getByRole('button', { name: /save changes/i });

    await user.clear(fullNameInput);
    await user.type(fullNameInput, 'Updated Name');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
    });
  });

  it('should update password successfully', async () => {
    const user = userEvent.setup({ delay: null });
    mockUpdatePassword.mockResolvedValue({ error: null });

    render(<Profile />);

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
    const updatePasswordButton = screen.getByRole('button', { name: /update password/i });

    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(updatePasswordButton);

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith('newpassword123');
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully');
    });
  });

  it('should validate password confirmation matches', async () => {
    const user = userEvent.setup({ delay: null });
    render(<Profile />);

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
    const updatePasswordButton = screen.getByRole('button', { name: /update password/i });

    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'differentpassword');
    await user.click(updatePasswordButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('should display error message on password update failure', async () => {
    const user = userEvent.setup({ delay: null });
    const error = new Error('Password update failed');
    mockUpdatePassword.mockResolvedValue({ error });

    render(<Profile />);

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
    const updatePasswordButton = screen.getByRole('button', { name: /update password/i });

    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(updatePasswordButton);

    await waitFor(() => {
      expect(screen.getByText(/password update failed/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button while updating profile', async () => {
    const user = userEvent.setup({ delay: null });
    mockUpdateProfile.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<Profile />);

    const fullNameInput = screen.getByLabelText(/full name/i);
    const saveButton = screen.getByRole('button', { name: /save changes/i });

    await user.clear(fullNameInput);
    await user.type(fullNameInput, 'Updated Name');
    await user.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should disable submit button while updating password', async () => {
    const user = userEvent.setup({ delay: null });
    mockUpdatePassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<Profile />);

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
    const updatePasswordButton = screen.getByRole('button', { name: /update password/i });

    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(updatePasswordButton);

    expect(updatePasswordButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show email as disabled field', () => {
    render(<Profile />);

    const emailInput = screen.getByDisplayValue(mockProfile.email!);
    expect(emailInput).toBeDisabled();
    expect(screen.getByText(/email cannot be changed/i)).toBeInTheDocument();
  });

  it('should handle profile with no phone number', () => {
    const profileWithoutPhone = { ...mockProfile, phone: null };
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: profileWithoutPhone,
      role: 'tcm',
      updateProfile: mockUpdateProfile,
      updatePassword: mockUpdatePassword,
    });

    render(<Profile />);

    const phoneInput = screen.getByLabelText(/phone/i);
    expect(phoneInput).toHaveValue('');
  });

  it('should update form when profile changes', async () => {
    const { rerender } = render(<Profile />);

    const updatedProfile = { ...mockProfile, full_name: 'New Name' };
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: updatedProfile,
      role: 'tcm',
      updateProfile: mockUpdateProfile,
      updatePassword: mockUpdatePassword,
    });

    rerender(<Profile />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('New Name')).toBeInTheDocument();
    });
  });
});

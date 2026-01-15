import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import ForgotPassword from './ForgotPassword';
import { useAuth } from '@/contexts/AuthContext';

// Mock dependencies
vi.mock('@/contexts/AuthContext');

// Mock LoadingSpinner
vi.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: ({ text, size }: { text?: string; size?: string }) => (
    <div data-testid="loading-spinner" data-size={size}>
      {text || 'Loading...'}
    </div>
  ),
}));

describe('ForgotPassword', () => {
  const mockResetPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      resetPassword: mockResetPassword,
    });
  });

  it('should render forgot password form', () => {
    render(<ForgotPassword />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByText(/back to sign in/i)).toBeInTheDocument();
  });

  it('should validate email field', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ForgotPassword />);

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid email', async () => {
    const user = userEvent.setup({ delay: null });
    mockResetPassword.mockResolvedValue({ error: null });

    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should show success message after successful submission', async () => {
    const user = userEvent.setup({ delay: null });
    mockResetPassword.mockResolvedValue({ error: null });

    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/back to sign in/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  it('should display error message on failure', async () => {
    const user = userEvent.setup({ delay: null });
    const error = new Error('Failed to send email');
    mockResetPassword.mockResolvedValue({ error });

    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to send email/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button while submitting', async () => {
    const user = userEvent.setup({ delay: null });
    mockResetPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should have link back to login page', () => {
    render(<ForgotPassword />);

    const backLink = screen.getAllByText(/back to sign in/i)[0];
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should have accessible form labels', () => {
    render(<ForgotPassword />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('type', 'email');
  });
});

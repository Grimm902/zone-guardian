import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import AdminSettings from './AdminSettings';
import { useSystemSettings, useUpdateSystemSettings } from '@/hooks/queries/useSystemSettings';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/hooks/queries/useSystemSettings', () => ({
  useSystemSettings: vi.fn(),
  useUpdateSystemSettings: vi.fn(),
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

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock LoadingSpinner
vi.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: ({ size, text }: { size?: string; text?: string }) => (
    <div data-testid="loading-spinner" data-size={size} data-text={text}>
      {text && <p>{text}</p>}
    </div>
  ),
}));

const mockSettings = {
  id: '00000000-0000-0000-0000-000000000000',
  organization_name: 'Test Organization',
  contact_email: 'contact@test.com',
  contact_phone: '+1 (555) 123-4567',
  contact_address: '123 Test St',
  timezone: 'America/New_York',
  date_format: 'MM/dd/yyyy',
  time_format: '12h' as const,
  logo_url: 'https://example.com/logo.png',
  default_language: 'en',
  system_description: 'Test description',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('AdminSettings', () => {
  const mockMutateAsync = vi.fn();
  const mockUpdateSettings = {
    mutateAsync: mockMutateAsync,
    isPending: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSystemSettings as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockSettings,
      isLoading: false,
      error: null,
    });
    (useUpdateSystemSettings as ReturnType<typeof vi.fn>).mockReturnValue(mockUpdateSettings);
  });

  it('should render settings form with current data', async () => {
    render(<AdminSettings />);

    expect(screen.getByText(/system settings/i)).toBeInTheDocument();

    // Wait for form to be populated with all values
    await waitFor(
      () => {
        expect(screen.getByDisplayValue(mockSettings.organization_name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockSettings.contact_email!)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockSettings.contact_phone!)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should display loading state', () => {
    (useSystemSettings as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<AdminSettings />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText(/loading settings/i)).toBeInTheDocument();
  });

  it('should display error state', () => {
    (useSystemSettings as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load'),
    });

    render(<AdminSettings />);

    expect(screen.getByText(/failed to load settings/i)).toBeInTheDocument();
  });

  it('should display all form sections', () => {
    render(<AdminSettings />);

    expect(screen.getByText(/organization information/i)).toBeInTheDocument();
    expect(screen.getByText(/localization/i)).toBeInTheDocument();
    expect(screen.getByText(/branding/i)).toBeInTheDocument();
  });

  it('should update settings successfully', async () => {
    const user = userEvent.setup({ delay: null });
    mockMutateAsync.mockResolvedValue(mockSettings);

    render(<AdminSettings />);

    // Wait for form to be populated - wait for multiple fields to ensure form is ready
    await waitFor(
      () => {
        expect(screen.getByDisplayValue(mockSettings.organization_name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockSettings.contact_email!)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const organizationInput = screen.getByLabelText(/organization name/i);
    const saveButton = screen.getByRole('button', { name: /save settings/i });

    // Clear and type new value
    await user.clear(organizationInput);
    await user.type(organizationInput, 'Updated Organization');

    // Wait for React Hook Form to update and form to be valid
    await waitFor(
      () => {
        expect(organizationInput).toHaveValue('Updated Organization');
      },
      { timeout: 2000 }
    );

    // Submit the form
    await user.click(saveButton);

    await waitFor(
      () => {
        expect(mockMutateAsync).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );

    // Verify the mutation was called with correct data
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_name: 'Updated Organization',
      })
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('System settings updated successfully');
    });
  });

  it('should display error message on update failure', async () => {
    const user = userEvent.setup({ delay: null });
    const error = new Error('Update failed');
    mockMutateAsync.mockRejectedValue(error);

    render(<AdminSettings />);

    // Wait for form to be populated
    await waitFor(
      () => {
        expect(screen.getByDisplayValue(mockSettings.organization_name)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockSettings.contact_email!)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const organizationInput = screen.getByLabelText(/organization name/i);
    const saveButton = screen.getByRole('button', { name: /save settings/i });

    await user.clear(organizationInput);
    await user.type(organizationInput, 'Updated Organization');

    // Wait for form to be ready
    await waitFor(
      () => {
        expect(organizationInput).toHaveValue('Updated Organization');
      },
      { timeout: 2000 }
    );

    await user.click(saveButton);

    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalled();
      },
      { timeout: 5000 }
    );

    expect(toast.error).toHaveBeenCalledWith('Update failed');
  });

  it('should disable submit button while updating', async () => {
    const user = userEvent.setup({ delay: null });
    (useUpdateSystemSettings as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(<AdminSettings />);

    const saveButton = screen.getByRole('button', { name: /saving/i });
    expect(saveButton).toBeDisabled();
  });

  it('should reset form when reset button is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    render(<AdminSettings />);

    const organizationInput = screen.getByLabelText(/organization name/i);
    const resetButton = screen.getByRole('button', { name: /reset changes/i });

    await user.clear(organizationInput);
    await user.type(organizationInput, 'Changed Name');
    await user.click(resetButton);

    await waitFor(() => {
      expect(organizationInput).toHaveValue(mockSettings.organization_name);
    });
  });

  it('should handle empty optional fields', () => {
    const settingsWithNulls = {
      ...mockSettings,
      contact_email: null,
      contact_phone: null,
      contact_address: null,
      logo_url: null,
      system_description: null,
    };

    (useSystemSettings as ReturnType<typeof vi.fn>).mockReturnValue({
      data: settingsWithNulls,
      isLoading: false,
      error: null,
    });

    render(<AdminSettings />);

    expect(screen.getByLabelText(/contact email/i)).toHaveValue('');
    expect(screen.getByLabelText(/contact phone/i)).toHaveValue('');
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup({ delay: null });

    render(<AdminSettings />);

    const organizationInput = screen.getByLabelText(/organization name/i);
    const saveButton = screen.getByRole('button', { name: /save settings/i });

    await user.clear(organizationInput);
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/organization name is required/i)).toBeInTheDocument();
    });
  });

  it('should prevent form submission with invalid email', async () => {
    const user = userEvent.setup({ delay: null });

    render(<AdminSettings />);

    // Wait for form to be populated
    await waitFor(
      () => {
        expect(screen.getByDisplayValue(mockSettings.organization_name)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const emailInput = screen.getByLabelText(/contact email/i) as HTMLInputElement;
    const saveButton = screen.getByRole('button', { name: /save settings/i });

    // Clear and type invalid email
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');

    // Wait for input to be updated
    await waitFor(
      () => {
        expect(emailInput).toHaveValue('invalid-email');
      },
      { timeout: 2000 }
    );

    // Try to submit - validation should prevent submission
    await user.click(saveButton);

    // Wait a moment for validation to process
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Form should not submit with invalid email - mutation should not be called
    // Note: React Hook Form will prevent onSubmit from being called if validation fails
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('should render timezone select field', async () => {
    render(<AdminSettings />);

    // Wait for form to be populated
    await waitFor(() => {
      expect(screen.getByDisplayValue(mockSettings.organization_name)).toBeInTheDocument();
    });

    const timezoneSelect = screen.getByLabelText(/timezone/i);
    expect(timezoneSelect).toBeInTheDocument();
  });
});

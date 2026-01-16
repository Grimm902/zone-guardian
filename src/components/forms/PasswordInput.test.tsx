import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render password input', () => {
    render(<PasswordInput />);

    const input = screen.getByRole('textbox', { hidden: true }) || screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should toggle visibility on button click', async () => {
    const user = userEvent.setup();
    render(<PasswordInput />);

    const input = screen.getByRole('textbox', { hidden: true }) || screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(input).toHaveAttribute('type', 'password');

    await user.click(toggleButton);

    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
  });

  it('should show password when visibility is toggled on', async () => {
    const user = userEvent.setup();
    render(<PasswordInput />);

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleButton);

    const input = screen.getByRole('textbox', { hidden: true }) || screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should hide password when visibility is toggled off', async () => {
    const user = userEvent.setup();
    render(<PasswordInput />);

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleButton);
    await user.click(screen.getByRole('button', { name: /hide password/i }));

    const input = screen.getByRole('textbox', { hidden: true }) || screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should update ARIA label with visibility state', async () => {
    const user = userEvent.setup();
    render(<PasswordInput />);

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    expect(toggleButton).toHaveAttribute('aria-label', 'Show password');

    await user.click(toggleButton);

    expect(screen.getByRole('button', { name: /hide password/i })).toHaveAttribute(
      'aria-label',
      'Hide password'
    );
  });

  it('should apply error state styling when error prop is provided', () => {
    render(<PasswordInput error="Password is required" />);

    const input = screen.getByRole('textbox', { hidden: true }) || screen.getByLabelText(/password/i);
    expect(input).toHaveClass('border-destructive');
  });

  it('should forward ref correctly', () => {
    const ref = vi.fn();
    render(<PasswordInput ref={ref} />);

    // Ref should be called with input element
    expect(ref).toHaveBeenCalled();
  });

  it('should handle keyboard navigation on toggle button', async () => {
    const user = userEvent.setup();
    render(<PasswordInput />);

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    toggleButton.focus();

    expect(document.activeElement).toBe(toggleButton);

    await user.keyboard('{Enter}');

    const input = screen.getByRole('textbox', { hidden: true }) || screen.getByLabelText(/password/i);
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should accept input value', async () => {
    const user = userEvent.setup();
    render(<PasswordInput />);

    const input = screen.getByRole('textbox', { hidden: true }) || screen.getByLabelText(/password/i);
    await user.type(input, 'mypassword123');

    expect(input).toHaveValue('mypassword123');
  });

  it('should pass through other input props', () => {
    render(<PasswordInput placeholder="Enter password" autoComplete="current-password" />);

    const input = screen.getByRole('textbox', { hidden: true }) || screen.getByPlaceholderText(/enter password/i);
    expect(input).toHaveAttribute('placeholder', 'Enter password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');
  });
});

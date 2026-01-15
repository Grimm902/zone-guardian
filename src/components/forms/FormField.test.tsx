import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { FormField } from './FormField';

describe('FormField', () => {
  it('should render label and input', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <input id="email" type="email" />
      </FormField>
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should display error message when provided', () => {
    render(
      <FormField label="Email" htmlFor="email" error="Email is required">
        <input id="email" type="email" />
      </FormField>
    );

    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('should not display error message when not provided', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <input id="email" type="email" />
      </FormField>
    );

    expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
  });

  it('should render required indicator when required prop is true', () => {
    render(
      <FormField label="Email" htmlFor="email" required>
        <input id="email" type="email" />
      </FormField>
    );

    const label = screen.getByText('Email');
    expect(label).toBeInTheDocument();
    // Required indicator should be present (asterisk)
    expect(label.textContent).toContain('*');
  });
});

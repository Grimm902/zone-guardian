import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('should render title and subtitle', () => {
    render(
      <AuthLayout title="Test Title" subtitle="Test Subtitle">
        <div>Test Content</div>
      </AuthLayout>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should render children', () => {
    render(
      <AuthLayout title="Test Title" subtitle="Test Subtitle">
        <div>Test Content</div>
      </AuthLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should display branding panel on desktop', () => {
    // Mock window width to desktop size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(
      <AuthLayout title="Test Title" subtitle="Test Subtitle">
        <div>Test Content</div>
      </AuthLayout>
    );

    expect(screen.getByText(/secure traffic management system/i)).toBeInTheDocument();
  });

  it('should render without subtitle', () => {
    render(
      <AuthLayout title="Test Title">
        <div>Test Content</div>
      </AuthLayout>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});

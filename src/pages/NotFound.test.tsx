import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import NotFound from './NotFound';

describe('NotFound', () => {
  it('should render 404 error message', () => {
    render(<NotFound />);

    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it('should have link to home page', () => {
    render(<NotFound />);

    const homeLink = screen.getByRole('link', { name: /return to home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should display helpful message', () => {
    render(<NotFound />);

    expect(screen.getByText(/oops! page not found/i)).toBeInTheDocument();
  });
});

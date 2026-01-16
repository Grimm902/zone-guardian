import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Reset window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => {
      const matches = query.includes('max-width: 767px') && window.innerWidth < 768;
      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.matchMedia = originalMatchMedia;
    vi.clearAllMocks();
  });

  it('should return false for desktop width', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return true for mobile width', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should update on window resize', async () => {
    const changeCallbacks: (() => void)[] = [];
    let mediaQueryList: MediaQueryList | null = null;

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (!mediaQueryList) {
        const matches = query.includes('max-width: 767px') && window.innerWidth < 768;
        mediaQueryList = {
          matches,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn((event: string, callback: () => void) => {
            if (event === 'change') {
              changeCallbacks.push(callback);
            }
          }),
          removeEventListener: vi.fn((event: string, callback: () => void) => {
            if (event === 'change') {
              const index = changeCallbacks.indexOf(callback);
              if (index > -1) {
                changeCallbacks.splice(index, 1);
              }
            }
          }),
          dispatchEvent: vi.fn(),
        } as MediaQueryList;
      }
      // Update matches based on current window width
      if (mediaQueryList) {
        (mediaQueryList as { matches: boolean }).matches =
          query.includes('max-width: 767px') && window.innerWidth < 768;
      }
      return mediaQueryList;
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    // Simulate resize to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    // Update matches property
    if (mediaQueryList) {
      (mediaQueryList as { matches: boolean }).matches = window.innerWidth < 768;
    }

    // Trigger all registered change callbacks
    changeCallbacks.forEach((callback) => {
      callback();
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    }, { timeout: 1000 });
  });

  it('should handle initial undefined state', () => {
    // The hook may return undefined initially before matchMedia fires
    const { result } = renderHook(() => useIsMobile());

    // Should return a boolean (false for desktop initially)
    expect(typeof result.current).toBe('boolean');
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.fn();
    const mockMediaQuery = {
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerSpy,
      dispatchEvent: vi.fn(),
    };

    window.matchMedia = vi.fn().mockReturnValue(mockMediaQuery);

    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    // Event listener should be cleaned up
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });

  it('should return true at exactly 767px (mobile breakpoint)', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should return false at exactly 768px (desktop breakpoint)', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});

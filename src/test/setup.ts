import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
// This must be set up before any tests run to ensure next-themes works correctly
// next-themes uses matchMedia to detect system theme preferences
const createMatchMediaMock = (query: string) => {
  const listeners: Array<() => void> = [];
  const mediaQueryList = {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn((callback: () => void) => {
      listeners.push(callback);
    }),
    removeListener: vi.fn((callback: () => void) => {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }),
    addEventListener: vi.fn((event: string, callback: () => void) => {
      if (event === 'change') {
        listeners.push(callback);
      }
    }),
    removeEventListener: vi.fn((event: string, callback: () => void) => {
      if (event === 'change') {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }),
    dispatchEvent: vi.fn(),
  };
  return mediaQueryList;
};

// Ensure matchMedia is always available and returns a valid object
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => createMatchMediaMock(query)),
  });
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver;

// Mock pointer capture methods for Radix UI components
if (typeof window !== 'undefined') {
  // Mock Element.prototype methods needed by Radix UI
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = vi.fn(() => false);
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = vi.fn();
  }

  // Mock scrollIntoView
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
}

import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

// jsdom implements neither of these, and Chakra's responsive helpers need both.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = window.ResizeObserver ?? (ResizeObserverStub as never);

window.scrollTo = window.scrollTo ?? (vi.fn() as never);

// Chart.js needs a 2D context; the charts themselves are not under test.
if (!HTMLCanvasElement.prototype.getContext) {
  HTMLCanvasElement.prototype.getContext = vi.fn() as never;
}

// jsdom has no layout engine, so scrolling APIs are missing. Chakra's Menu
// calls Element.scrollTo when it moves focus between items.
Element.prototype.scrollTo = Element.prototype.scrollTo ?? (vi.fn() as never);
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (vi.fn() as never);

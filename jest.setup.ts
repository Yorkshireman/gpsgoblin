import '@testing-library/jest-dom';

// JSDOM has no media-query engine. Use its static width for min-width queries;
// actual responsive mounting and resize events are exercised in browser tests.
if (typeof window !== 'undefined') {
  window.matchMedia = (query: string) => {
    const minimum = query.match(/\(min-width:\s*([\d.]+)(px|rem|em)\)/);
    return {
      matches: minimum ? Number(minimum[1]) * (minimum[2] === 'px' ? 1 : 16) <= window.innerWidth : false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    };
  };
}

// JSDOM has no layout or ResizeObserver; Chrome tests exercise chart resizing.
global.ResizeObserver = class implements ResizeObserver {
  observe = () => {
    return;
  };
  unobserve = () => {
    return;
  };
  disconnect = () => {
    return;
  };
};

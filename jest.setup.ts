import '@testing-library/jest-dom';

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

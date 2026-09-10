import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import type { Track, TrackSegment } from '@/domain/activityDocument';

import { RouteMap } from './RouteMap';
import { initialiseRouteMap } from './initialiseRouteMap';

jest.mock('./initialiseRouteMap', () => {
  return { initialiseRouteMap: jest.fn() };
});

const firstSegment: TrackSegment = {
  id: 'segment-0',
  samples: [
    { id: 'point-0', latitudeDegrees: 0, longitudeDegrees: 0 },
    { id: 'point-1', latitudeDegrees: 0, longitudeDegrees: 1 }
  ]
};

const secondSegment: TrackSegment = {
  id: 'segment-1',
  samples: [
    { id: 'point-2', latitudeDegrees: 0, longitudeDegrees: 10 },
    { id: 'point-3', latitudeDegrees: 0, longitudeDegrees: 12 }
  ]
};

const track: Track = {
  id: 'track-0',
  name: 'Segmented walk',
  segments: [firstSegment, secondSegment]
};

describe('RouteMap segment selection', () => {
  it('redraws only the selected segment and restores all segments with cleanup', () => {
    const originalWebGl = Object.getOwnPropertyDescriptor(globalThis, 'WebGLRenderingContext');
    const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
    const dispose = jest.fn();
    jest.mocked(initialiseRouteMap).mockReturnValue(dispose);

    // Exercise the effect without a real canvas; rendering is delegated to the mocked initializer.
    Object.defineProperty(globalThis, 'WebGLRenderingContext', {
      configurable: true,
      value: Object
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: jest.fn()
    });

    try {
      const { rerender, unmount } = render(
        <ChakraProvider value={defaultSystem}>
          <RouteMap track={track} />
        </ChakraProvider>
      );

      expect(initialiseRouteMap).toHaveBeenLastCalledWith(
        expect.objectContaining({ paths: [firstSegment, secondSegment] })
      );

      rerender(
        <ChakraProvider value={defaultSystem}>
          <RouteMap track={track} segment={secondSegment} />
        </ChakraProvider>
      );

      expect(screen.getByText('Track segment 2 of 2')).toBeVisible();
      expect(initialiseRouteMap).toHaveBeenLastCalledWith(
        expect.objectContaining({ paths: [secondSegment] })
      );
      expect(dispose).toHaveBeenCalledTimes(1);

      rerender(
        <ChakraProvider value={defaultSystem}>
          <RouteMap track={track} />
        </ChakraProvider>
      );

      expect(screen.getByText('2 track segments')).toBeVisible();
      expect(initialiseRouteMap).toHaveBeenLastCalledWith(
        expect.objectContaining({ paths: [firstSegment, secondSegment] })
      );
      expect(dispose).toHaveBeenCalledTimes(2);

      unmount();
      expect(dispose).toHaveBeenCalledTimes(3);
    } finally {
      if (originalWebGl) {
        Object.defineProperty(globalThis, 'WebGLRenderingContext', originalWebGl);
      } else {
        Reflect.deleteProperty(globalThis, 'WebGLRenderingContext');
      }
      if (originalScroll) {
        Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScroll);
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
      }
    }
  });
});

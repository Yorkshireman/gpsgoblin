import { Text } from '@chakra-ui/react';
import { renderToString } from 'react-dom/server';
import { Provider } from './provider';

it('keeps server-rendered style classes independent of earlier page renders', () => {
  const renderLabel = (reverse: boolean) => {
    const html = renderToString(
      <Provider>
        {reverse
          ? <Text color='fg.muted' fontSize='19px'>Inspection label</Text>
          : <Text fontSize='19px' color='fg.muted'>Inspection label</Text>}
      </Provider>
    );
    return html.match(/<p class="([^"]+)"[^>]*>Inspection label<\/p>/)?.[1];
  };
  const first = renderLabel(false);
  const reversed = renderLabel(true);
  expect(first).toBeDefined();
  expect(reversed).toBeDefined();
  // Each request must produce its own deterministic order, without inheriting
  // the order of equivalent styles cached during another page's request.
  expect(reversed).not.toBe(first);
  expect(renderLabel(false)).toBe(first);
  expect(renderLabel(true)).toBe(reversed);
});

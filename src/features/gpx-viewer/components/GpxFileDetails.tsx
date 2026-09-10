import { Heading, Stack, Text } from '@chakra-ui/react';

import type { ImportedGpxDocument } from '@/domain/activityDocument';

type GpxFileDetailsProps = Readonly<{
  document: ImportedGpxDocument;
}>;

export const GpxFileDetails = ({ document }: GpxFileDetailsProps) => {
  const fields = [
    { label: 'Name', value: document.metadata?.name },
    { label: 'Description', value: document.metadata?.description },
    { label: 'Created by', value: document.creator }
  ].filter(field => {
    return Boolean(field.value);
  });

  if (fields.length === 0) {
    return null;
  }

  return (
    <Stack as='section' aria-labelledby='file-details-heading' gap={3}>
      <Heading as='h3' id='file-details-heading' size='lg'>
        File details
      </Heading>
      <Stack as='dl' gap={3}>
        {fields.map(field => {
          return (
            <Stack key={field.label} gap={1}>
              <Text as='dt' fontWeight='medium'>{field.label}</Text>
              <Text as='dd' overflowWrap='anywhere' whiteSpace='pre-wrap'>
                {field.value}
              </Text>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};

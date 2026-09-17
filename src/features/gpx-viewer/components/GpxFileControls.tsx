import {
  Alert,
  Button,
  FileUpload,
  Flex,
  Spinner,
  Text
} from '@chakra-ui/react';
import { useRef } from 'react';

import { GpxShareButton } from '../sharing';

type GpxFileControlsProps = Readonly<{
  canClear: boolean;
  showDropzone: boolean;
  isLoading: boolean;
  filename?: string;
  onReset?: () => void;
  onClear: () => void;
  onCancel: () => void;
  share?: Readonly<{
    unavailableReason?: string;
    createLink: () => Promise<string>;
    onNotice: (notice: string) => void;
  }>;
}>;

export const GpxFileControls = ({
  canClear,
  showDropzone,
  isLoading,
  filename,
  onReset,
  onClear,
  onCancel,
  share
}: GpxFileControlsProps) => {
  const chooser = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FileUpload.Label srOnly>GPX file</FileUpload.Label>
      <FileUpload.HiddenInput />
      {showDropzone ? (
        <FileUpload.Dropzone
          _hover={{ bg: 'bg' }}
          cursor="default"
          disableClick
          width="full"
        >
          <FileUpload.DropzoneContent>
            <Text fontWeight="medium">Drag and drop a GPX file here</Text>
            <Text color="fg.muted">GPX 1.1 files</Text>
          </FileUpload.DropzoneContent>
        </FileUpload.Dropzone>
      ) : null}
      <Flex gap={2} align="center" wrap="wrap" width="full">
        {filename ? (
          <Text
            fontWeight="medium"
            minW={0}
            title={filename}
            flex={{ base: '1 1 100%', md: '1 1 6rem' }}
            whiteSpace={{ base: 'normal', md: 'nowrap' }}
            overflow={{ base: 'visible', md: 'hidden' }}
            textOverflow={{ base: 'clip', md: 'ellipsis' }}
            overflowWrap="anywhere"
          >
            {filename}
          </Text>
        ) : null}
        <FileUpload.Trigger asChild>
          <Button ref={chooser} type="button" variant="outline">
            {filename ? 'Change GPX file' : 'Choose GPX file'}
          </Button>
        </FileUpload.Trigger>
        {share ? <GpxShareButton {...share} /> : null}
        {onReset ? (
          <Button
            type="button"
            variant="outline"
            colorPalette="orange"
            disabled={isLoading}
            onClick={onReset}
          >
            Reset view
          </Button>
        ) : null}
        {canClear ? (
          <Button
            colorPalette="gray"
            type="button"
            variant="outline"
            onClick={() => {
              onClear();
              chooser.current?.focus();
              return;
            }}
          >
            Clear file
          </Button>
        ) : null}
      </Flex>
      {isLoading ? (
        <Alert.Root role="status" status="info">
          <Spinner aria-hidden="true" size="sm" />
          <Alert.Content>
            <Alert.Title>Opening GPX file</Alert.Title>
          </Alert.Content>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onCancel();
              chooser.current?.focus();
              return;
            }}
          >
            Cancel import
          </Button>
        </Alert.Root>
      ) : null}
    </>
  );
};

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
  filename?: string;
  isLoading: boolean;
  onCancel: () => void;
  onClear: () => void;
  onReset?: () => void;
  share?: Readonly<{
    createLink: () => Promise<string>;
    onNotice: (notice: string) => void;
    unavailableReason?: string;
  }>;
  showDropzone: boolean;
}>;

export const GpxFileControls = ({
  canClear,
  filename,
  isLoading,
  onCancel,
  onClear,
  onReset,
  share,
  showDropzone
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
      <Flex align="center" gap={2} width="full" wrap="wrap">
        {filename ? (
          <Text
            flex={{ base: '1 1 100%', md: '1 1 6rem' }}
            fontWeight="medium"
            minW={0}
            overflow={{ base: 'visible', md: 'hidden' }}
            overflowWrap="anywhere"
            textOverflow={{ base: 'clip', md: 'ellipsis' }}
            title={filename}
            whiteSpace={{ base: 'normal', md: 'nowrap' }}
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
            colorPalette="orange"
            disabled={isLoading}
            onClick={onReset}
            type="button"
            variant="outline"
          >
            Reset view
          </Button>
        ) : null}
        {canClear ? (
          <Button
            colorPalette="gray"
            onClick={() => {
              onClear();
              chooser.current?.focus();
              return;
            }}
            type="button"
            variant="outline"
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
            onClick={() => {
              onCancel();
              chooser.current?.focus();
              return;
            }}
            type="button"
            variant="outline"
          >
            Cancel import
          </Button>
        </Alert.Root>
      ) : null}
    </>
  );
};

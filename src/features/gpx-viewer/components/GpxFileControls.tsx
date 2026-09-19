import {
  Alert,
  Button,
  FileUpload,
  Flex,
  Spinner,
  Text
} from '@chakra-ui/react';
import { useRef } from 'react';

type GpxFileControlsProps = Readonly<{
  canClear: boolean;
  filename?: string;
  isExample: boolean;
  isLoading: boolean;
  isLoadingExample: boolean;
  onClear: () => void;
  onCancel: () => void;
  onReset?: () => void;
  onTryExample?: () => void;
  showDropzone: boolean;
}>;

export const GpxFileControls = ({
  canClear,
  filename,
  isExample,
  isLoading,
  isLoadingExample,
  onClear,
  onCancel,
  onReset,
  onTryExample,
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
      <Flex gap={2} align="center" wrap="wrap" width="full">
        {filename || isExample ? (
          <Text
            fontWeight="medium"
            flex={{ base: '1 1 100%', md: '1 1 6rem' }}
            minW={0}
            overflow={{ base: 'visible', md: 'hidden' }}
            overflowWrap="anywhere"
            whiteSpace={{ base: 'normal', md: 'nowrap' }}
            textOverflow={{ base: 'clip', md: 'ellipsis' }}
            title={isExample ? 'Example activity' : filename}
          >
            {isExample ? 'Example activity' : filename}
          </Text>
        ) : null}
        <FileUpload.Trigger asChild>
          <Button ref={chooser} type="button" variant="outline">
            {isExample
              ? 'Open your own file'
              : filename
                ? 'Change GPX file'
                : 'Choose GPX file'}
          </Button>
        </FileUpload.Trigger>
        {onTryExample ? (
          <Button colorPalette="action" type="button" onClick={onTryExample}>
            Try an example
          </Button>
        ) : null}
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
            <Alert.Title>
              {isLoadingExample
                ? 'Opening example activity'
                : 'Opening GPX file'}
            </Alert.Title>
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

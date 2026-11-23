import {
  GeneratedCodeEditor,
  type GeneratedCodeEditorProps,
} from '@codegena/ui-unified/code-editor';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { type ReactElement, useCallback, useState } from 'react';

type GeneratedCodeEditorTransitionStoryProps = Extract<
  GeneratedCodeEditorProps,
  { mode?: 'full' }
>;

export function GeneratedCodeEditorTransitionStory(
  props: GeneratedCodeEditorTransitionStoryProps,
): ReactElement {
  const [syntaxReady, setSyntaxReady] = useState(false);

  const handleApplySyntax = useCallback((): void => {
    setSyntaxReady(true);
  }, []);

  return (
    <Stack spacing={1}>
      <Button
        onClick={handleApplySyntax}
        size="small"
        sx={{ alignSelf: 'flex-start' }}
      >
        Apply syntax colors
      </Button>
      <GeneratedCodeEditor
        {...props}
        syntaxReady={syntaxReady}
      />
    </Stack>
  );
}

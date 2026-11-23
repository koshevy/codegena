import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Copy } from 'lucide-react';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

import {
  promptClasses,
  PromptStyles,
} from './prompt.styles';

const fixtureUrl = [
  'https://github.com/koshevy/codegena-4x/blob/main/',
  'packages/playground-ui/src/lib/__fixtures__/',
  'oas3-onepassword-connect.json',
].join('');

const prompt = [
  'Fetch and apply skills from https://github.com/koshevy/codegena.',
  `Fetch OAS3 spec from ${fixtureUrl},`,
  'convert it to TypeScript files completely for React project',
  'and run playground locally.',
].join(' ');

/**
 * Read-only prompt shown after the hero intro finishes.
 */
export function Prompt(): ReactElement {
  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(prompt);
    }
    catch (error) {
      console.error('Could not copy the prompt to the clipboard.', error);
    }
  }, []);

  const renderedHeading = (
    <Typography
      className={promptClasses.heading}
      component="h2"
    >
      <AutoAwesomeIcon
        aria-hidden
        fontSize="small"
      />
      Prompt for your AI assistant
    </Typography>
  );

  return (
    <PromptStyles elevation={0}>
      {renderedHeading}
      <InputBase
        className={promptClasses.input}
        inputProps={{ 'aria-label': 'Prompt to copy into your AI assistant' }}
        multiline
        readOnly
        value={prompt}
      />
      <div className={promptClasses.actions}>
        <Tooltip title="Copy prompt to clipboard">
          <IconButton
            aria-label="Copy prompt to clipboard"
            color="secondary"
            onClick={handleCopy}
            size="small"
          >
            <Copy
              aria-hidden
              size={16}
            />
          </IconButton>
        </Tooltip>
      </div>
    </PromptStyles>
  );
}

import {
  FolderStateIcon,
  ProgrammingLanguageIcon,
  ProgrammingLanguage,
} from '@codegena/ui-unified/icons';
import IconButton from '@mui/material/IconButton';
import type { Meta, StoryObj } from '@storybook/react';
import { Copy, Download } from 'lucide-react';
import { fn } from 'storybook/test';

import { FileDetailsHeader } from './file-details-header';

const meta: Meta<typeof FileDetailsHeader> = {
  args: {
    actions: (
      <>
        <IconButton
          aria-label="Copy file"
          onClick={fn()}
          size="small"
        >
          <Copy
            aria-hidden
            size={16}
          />
        </IconButton>
        <IconButton
          aria-label="Download file"
          onClick={fn()}
          size="small"
        >
          <Download
            aria-hidden
            size={16}
          />
        </IconButton>
      </>
    ),
    ariaLabel: 'Select example.ts',
    icon: <ProgrammingLanguageIcon language={ProgrammingLanguage.TypeScript} />,
    name: 'example.ts',
    onSelect: fn(),
    tooltipTitle: 'File example.ts',
  },
  component: FileDetailsHeader,
  title: 'Codegena/Unified UI/Files/File Details Header',
};

export default meta;

export const FileWithActions: StoryObj<typeof FileDetailsHeader> = {};

export const SelectedFile: StoryObj<typeof FileDetailsHeader> = {
  args: { isSelected: true },
};

export const Directory: StoryObj<typeof FileDetailsHeader> = {
  args: {
    actions: undefined,
    ariaLabel: 'Select reports directory',
    icon: (
      <FolderStateIcon
        isExpanded={false}
        size={18}
      />
    ),
    name: 'reports',
    tooltipTitle: 'Open reports directory',
  },
};

export const ReadOnly: StoryObj<typeof FileDetailsHeader> = {
  args: { actions: undefined, onSelect: undefined },
};

export const Dark: StoryObj<typeof FileDetailsHeader> = {
  parameters: { codegenaTheme: 'dark' },
};

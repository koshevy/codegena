import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react';

import { ProgrammingLanguage } from './programming-language';
import { ProgrammingLanguageIcon } from './programming-language-icon';

const meta: Meta<typeof ProgrammingLanguageIcon> = {
  args: { language: ProgrammingLanguage.TypeScript },
  component: ProgrammingLanguageIcon,
  title: 'Codegena/Unified UI/Icons/Programming Language Icon',
};

export default meta;

export const Default: StoryObj<typeof ProgrammingLanguageIcon> = {};

export const WithoutTooltip: StoryObj<typeof ProgrammingLanguageIcon> = {
  args: { showTooltip: false },
};

export const AllLanguages: StoryObj<typeof ProgrammingLanguageIcon> = {
  render: (args) => (
    <Stack
      direction="row"
      spacing={2}
    >
      {Object.values(ProgrammingLanguage).map((language) => (
        <Stack
          alignItems="center"
          key={language}
          spacing={1}
        >
          <ProgrammingLanguageIcon
            {...args}
            language={language}
          />
          <Typography variant="caption">{language}</Typography>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Python: StoryObj<typeof ProgrammingLanguageIcon> = {
  args: { language: ProgrammingLanguage.Python },
};

export const Unknown: StoryObj<typeof ProgrammingLanguageIcon> = {
  args: { language: ProgrammingLanguage.Unknown },
};

export const Compact: StoryObj<typeof ProgrammingLanguageIcon> = {
  args: { size: '1rem' },
};

export const Large: StoryObj<typeof ProgrammingLanguageIcon> = {
  args: { size: '2rem' },
};

export const Dark: StoryObj<typeof ProgrammingLanguageIcon> = {
  parameters: { codegenaTheme: 'dark' },
};

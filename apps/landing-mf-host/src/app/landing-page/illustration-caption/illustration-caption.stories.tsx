import type { Meta, StoryObj } from '@storybook/react';

import { IllustrationCaption } from './illustration-caption';

const meta: Meta<typeof IllustrationCaption> = {
  args: {
    children: 'A generated interface with string patterns represented as literal types.',
  },
  component: IllustrationCaption,
  parameters: { codegenaTheme: 'dark' },
  title: 'Codegena/Landing/Illustrations/Caption',
};

export default meta;

export const Default: StoryObj<typeof IllustrationCaption> = {};

export const WithInlineCode: StoryObj<typeof IllustrationCaption> = {
  args: {
    children: (
      <>
        The <code>minItems</code> constraint becomes a tuple with required items.
      </>
    ),
  },
};

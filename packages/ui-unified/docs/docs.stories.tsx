import type { Meta, StoryObj } from '@storybook/react-vite';

import { DocsAlert, DocsInlineCode, DocsTabs } from './index';

const meta = {
  title: 'Docs/Article components',
  component: DocsTabs,
  args: {
    ariaLabel: 'Installation method',
    items: [
      { label: 'npm', value: 'npm', content: <DocsInlineCode>npm ci</DocsInlineCode> },
      {
        label: 'Bun',
        value: 'bun',
        content: <DocsInlineCode>bun install</DocsInlineCode>,
      },
    ],
  },
} satisfies Meta<typeof DocsTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Installation: Story = {
  render: (args) => (
    <>
      <DocsAlert severity="info">
        Run these commands from the repository root.
      </DocsAlert>
      <DocsTabs {...args} />
    </>
  ),
};
